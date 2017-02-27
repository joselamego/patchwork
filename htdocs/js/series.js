$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip()
    revTab=document.getElementById('revs-list')
    coverView=document.getElementById('cover-letter-view')
    patchView=document.getElementById('patch-view')
    patchList=document.getElementById('patches-list')
    patchesInput=$( "input[name^='patches']" )
    seriesForms=document.getElementById('seriesForm')
    var patches = new Array()
    if ($( patchesInput[0] ).value){
        patches=json_decode($( patchesInput[0] ).value, true)
    }
    else{
        patches=[]
    }
    revTab.style.border='none'
    revTab.style.background='transparent'
    revTab.style.padding='15px'
    coverView.style.display='block'
    patchView.style.display='none'
    patchList.style.display='none'
    seriesForms.style.display='none'

    document.getElementById('cover-letter-tab').onclick=function(){
        coverView.style.display='block'
        patchView.style.display='none'
        patchList.style.display='none'
        patches=[]
        for (i=0; i<patchesInput.length; ++i){
            $( patchesInput[i] ).prop('value', JSON.stringify(patches))
        }
    }

    document.getElementById('patches-tab').onclick=function(){
        coverView.style.display='none'
        patchList.style.display='block'
        patchView.style.display="none"
        patches=[]
        for (i=0; i<patchesInput.length; ++i){
            $( patchesInput[i] ).prop('value', "")
        }
        uncheck_allSel()
        uncheck_allInput()
        seriesForms.style.display='none'
    }

    $('#revs-list').on('change', function(e){
        var optionSelected=$("option:selected", this)
        jQuery('.tab-content div.tab-pane.fade.in.active').
        removeClass(' in active')
        jQuery('.tab-content div#'+this.value+'.tab-pane.fade').
        addClass(' in active')
        patchView.style.display='none'
        uncheck_allSel()
        uncheck_allInput()
        patches=[]
        for (i=0; i<patchesInput.length; ++i){
            $( patchesInput[i] ).prop('value', "")
        }
        seriesForms.style.display='none'
    })

    $('.patch-link').on('click', function(){
        var pa=this.getAttribute("data-url")
        pa=pa.match(/\d+/)[0]
        coverView.style.display='none'
        patchList.style.display='none'
        patchView.style.display='block'
        patchView.innerHTML=
        '<p style="text-align:center;">Loading patch...</p>'
        uncheck_allInput()
        uncheck_allSel()
        patches=[]
        for (i=0; i<patchesInput.length; ++i){
            $( patchesInput[i] ).prop('value', "")
        }
        seriesForms.style.display='none'
        $("#patch-view").load(this.getAttribute("data-url") + " #patch-body", 
                              function(){
            $( '#patch-view form' ).append('<input type="hidden" name="patches" value="['+pa+']"/>')
        })
    })

    $( "input[name^='patch_id']" ).change(function(){
        patchView.style.display="none"
        uncheck_allSel()
        var p_id=$(this).attr('name').replace('patch_id:', '')
            if ($(this).prop('checked')){
                insert_patchId(p_id)
                for (i=0; i<patchesInput.length; ++i){
                    $( patchesInput[i] ).prop('value', JSON.stringify(patches))
                }
                seriesForms.style.display='block'
            }
            else{
                remove_patchId(p_id)
                if (patches==""){
                    for (i=0; i<patchesInput.length; ++i){
                        $( patchesInput[i] ).prop('value', "")
                    }
                    seriesForms.style.display='none'
                }
                else{
                    for (i=0; i<patchesInput.length; ++i){
                        $( patchesInput[i] ).prop('value', JSON.stringify(patches))
                    }
                }
            }
        })

    $( "input[name$='sel-all']" ).change(function(){
        rev=this.getAttribute("name")
        rev=rev.match(/\d+/)[0]
        uncheck_allInput()
        patches=[]
        boxes=$( "input[name^='patch_id']" )
        if ( $(this).prop('checked') ){
            for (i=0; i<boxes.length; ++i){
                if (boxes[i].getAttribute("data-rev")==rev){
                    p_id=boxes[i].getAttribute("name")
                    p_id=p_id.match(/\d+/)[0]
                    $(boxes[i]).prop('checked', true)
                    insert_patchId(p_id)
                }
            seriesForms.style.display='block'
            }
            for (i=0; i<patchesInput.length; ++i){
                $( patchesInput[i] ).prop('value', JSON.stringify(patches))
            }
        }
        else{
            seriesForms.style.display='none'
            for (i=0; i<patchesInput.length; ++i){
                $( patchesInput[i] ).prop('value', "")
            }
            }
    })

    function insert_patchId(id){
        if (!patches.includes(id)){
            patches.push(id)
        }
    }

    function remove_patchId(id){
        if (patches.includes(id)){
            index=patches.indexOf(id)
            patches.splice(index, 1)
       }
    }

    function uncheck_allInput(){
        boxes=$( "input[name^='patch_id']" )
        for (i=0; i<boxes.length; ++i){
            $(boxes[i]).prop("checked", false)
        }
    }

    function uncheck_allSel(){
        sels=$( "input[name$='sel-all']" )
        for (i=0; i<sels.length; ++i){
            $(sels[i]).prop("checked", false)
        }

    }

})
