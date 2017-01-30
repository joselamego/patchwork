$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip()
    revTab=document.getElementById('revs-list')
    coverView=document.getElementById('cover-letter-view'),
    patchView=document.getElementById('patch-view'),
    patchList=document.getElementById('patches-list')

    revTab.style.border='none'
    revTab.style.background='transparent'
    revTab.style.padding='15px'
    coverView.style.display='block'
    patchView.style.display='none'
    patchList.style.display='none'

    document.getElementById('cover-letter-tab').onclick=function(){
        coverView.style.display='block'
        patchView.style.display='none'
        patchList.style.display='none'
    }

    document.getElementById('patches-tab').onclick=function(){
        coverView.style.display='none'
        patchList.style.display='block'
        patchView.style.display="none"
    }

    $('#revs-list').on('change', function(e){
        var optionSelected=$("option:selected", this)
        jQuery('.tab-content div.tab-pane.fade.in.active').
        removeClass(' in active')
        jQuery('.tab-content div#'+this.value+'.tab-pane.fade').
        addClass(' in active')
        patchView.style.display='none'
    })

    $('.patch-link').on('click', function(){
        var pa=this.getAttribute("data-url")
        var curr_rev=document.getElementById('revs-list').value
        pa=pa.match(/\d+/)[0]
        coverView.style.display='none'
        patchView.style.display='block'
        patchView.innerHTML=
        '<p style="text-align:center;">Loading patch...</p>'
        $("#patch-view").load(
            this.getAttribute("data-url") + " #patch-body", function() {
                forms=document.forms
                for (i=0; i<document.forms.length; i++){
                    var n=(i + 1)
                    var patch_field=document.createElement("input")
                    patch_field.type="hidden"
                    patch_field.name="patch"
                    patch_field.value=pa
                    var div=document.createElement("div")
                    var this_form=document.forms.item(i)
                    if (typeof this_form !== "undefined"){
                        this_form.appendChild(div)
                        div.appendChild(patch_field)
                    }
                }
            }
        )
    })
})
