# Patchwork - automated patch tracking system
# Copyright (C) 2014 Intel Corporation
#
# This file is part of the Patchwork package.
#
# Patchwork is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# Patchwork is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with Patchwork; if not, write to the Free Software
# Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA

from django.conf import settings
from django.shortcuts import render, render_to_response
from django.shortcuts import get_object_or_404, get_list_or_404
from django.http import HttpResponseForbidden
from django.views.generic import View
from patchwork.models import Patch, Project, Bundle
from patchwork.models import Series, SeriesRevision, TestResult
from patchwork.requestcontext import PatchworkRequestContext
from patchwork.forms import PatchForm, CreateBundleForm


class SeriesListView(View):

    def get(self, request, *args, **kwargs):
        project = get_object_or_404(Project, linkname=kwargs['project'])
        is_editable = 'true' if project.is_editable(request.user) else 'false'
        return render(request, 'patchwork/series-list.html', {
            'project': project,
            'is_editable': is_editable,
            'default_patches_per_page': settings.DEFAULT_PATCHES_PER_PAGE,
        })


class SeriesView(View):

    def get(self, request, *args, **kwargs):
        series = get_object_or_404(Series, pk=kwargs['series'])
        revisions = get_list_or_404(SeriesRevision, series=series)
        for revision in revisions:
            revision.patch_list = revision.ordered_patches().\
                select_related('state', 'submitter')
            revision.test_results = TestResult.objects \
                    .filter(revision=revision, patch=None) \
                    .order_by('test__name').select_related('test')

        return render(request, 'patchwork/series.html', {
            'series': series,
            'project': series.project,
            'cover_letter': revision.cover_letter,
            'revisions': revisions,
        })

    def post(self, request, *args, **kwargs):
        init_data = request.POST
        pa_id = init_data.get('patch', None)
        curr_rev = init_data.get('rev', None)
        patch = get_object_or_404(Patch, id=pa_id)
        series = get_object_or_404(Series, pk=kwargs['series'])
        context = PatchworkRequestContext(request)
        context.project = patch.project
        editable = patch.is_editable(request.user)

        revisions = get_list_or_404(SeriesRevision, series=series)
        for revision in revisions:
            revision.patch_list = revision.ordered_patches().\
                select_related('state', 'submitter')
            revision.test_results = TestResult.objects \
                    .filter(revision=revision, patch=None) \
                    .order_by('test__name').select_related('test')

        form = None
        createbundleform = None

        if editable:
            form = PatchForm(instance=patch)
        if request.user.is_authenticated():
            createbundleform = CreateBundleForm()

        if request.method == 'POST':
            action = request.POST.get('action', None)
            if action:
                action = action.lower()

            if action == 'createbundle':
                bundle = Bundle(owner=request.user, project=patch.project)
                createbundleform = CreateBundleForm(instance=bundle,
                                                    data=request.POST)
                if createbundleform.is_valid():
                    createbundleform.save()
                    bundle.append_patch(patch)
                    bundle.save()
                    createbundleform = CreateBundleForm()
                    context.add_message('Bundle %s created' % bundle.name)

            elif action == 'addtobundle':
                bundle = get_object_or_404(
                    Bundle, id=request.POST.get('bundle_id'))
                try:
                    bundle.append_patch(patch)
                    bundle.save()
                    context.add_message('Patch added to bundle "%s"' %
                                        bundle.name)
                except Exception as ex:
                    context.add_message("Couldn't add patch '%s' to bundle %s:\
 %s" % (patch.name, bundle.name, ex.message))

            # all other actions require edit privs
            elif not editable:
                return HttpResponseForbidden()

            elif action is None:
                form = PatchForm(data=request.POST, instance=patch)
                if form.is_valid():
                    form.save()
                    context.add_message('Patch ID: %s updated' % patch.pk)

        context['series'] = series
        context['patchform'] = form
        context['createbundleform'] = createbundleform
        context['project'] = patch.project
        context['revisions'] = revisions
        context['test_results'] = TestResult.objects \
            .filter(revision=None, patch=patch) \
            .order_by('test__name').select_related('test')

        return render_to_response('patchwork/series.html', context)
