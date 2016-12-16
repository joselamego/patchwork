$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();
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
        coverView.style.display='none'
        patchView.style.display='block'
        patchView.innerHTML=
        '<p style="text-align:center;">Loading patch...</p>'
        $("#patch-view").load(this.getAttribute("data-url") + " #patch-body")
    })
})
