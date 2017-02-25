spa.shell = (function(){
    var 
    configMap = {
        anchor_schema_map: {
            chat: { opened: true, closed: false}
        },
        main_html: ''
        +'    <div class="spa-shell-head">                   '  
        +'        <div class="spa-shell-head-logo"></div>    ' 
        +'        <div class="spa-shell-head-acct"></div>    ' 
        +'        <div class="spa-shell-head-search"></div>  ' 
        +'    </div>                                         ' 
        +'    <div class="spa-shell-main">                   ' 
        +'        <div class="spa-shell-main-nav"></div>     ' 
        +'        <div class="spa-shell-main-content"></div> ' 
        +'    </div>                                         ' 
        +'    <div class="spa-shell-foot"></div>             ' 
        +'    <div class="spa-shell-modal"></div>            ' ,
    },
    stateMap = {
        anchor_map: {},
    },
    copyAnchorMap,
    changeAnchorPart,
    onHashchange,
    jqueryMap = {},
    setChatAnchor,
    setJqueryMap, 
    initModule;
    copyAnchorMap = function(){
        return $.extend( true, {}, stateMap.anchor_map )
    };
    setChatAnchor = function(position_type){
        return changeAnchorPart({chat: position_type})
    };
    setJqueryMap = function(){
        var $container = stateMap.$container;
        jqueryMap = {
            $container: $container,
        }
    };
    changeAnchorPart = function( arg_map ){
        var 
            anchor_map_revise = copyAnchorMap(),
            bool_return = true,
            key_name, key_name_dep;
        KEYVAL:
        for( key_name in arg_map ){
            if(arg_map.hasOwnProperty(key_name)){
                if(key_name.indexOf('_') === 0 ){
                    continue KEYVAL;
                }
                anchor_map_revise[key_name] = arg_map[key_name];
                key_name_dep = '_' + key_name;
                if( arg_map[key_name_dep] ){
                    anchor_map_revise[key_name_dep] = arg_map[key_name_dep]
                }
                else{
                    delete anchor_map_revise[key_name_dep];
                    delete anchor_map_revise['_s'+key_name_dep];
                }
            }
        }
        try{
            $.uriAnchor.setAnchor( anchor_map_revise );
        }   
        catch(error){
            $.uriAnchor.setAnchor( stateMap.anchor_map, null, true );
            bool_return = false;
        }
        return bool_return;
    };
    onHashchange = function( event ){
        var 
            anchor_map_previous = copyAnchorMap(),
            anchor_map_proposed,
            _s_chat_previous, _s_chat_proposed,
            s_chat_proposed,
            is_ok = true;
        try {
            anchor_map_proposed = $.uriAnchor.makeAnchorMap();
        }catch(error){
            $.uriAnchor.setAnchor( anchor_map_previous, null, true );
            return false;
        }
        stateMap.anchor_map = anchor_map_proposed;
        _s_chat_previous = anchor_map_previous._s_chat;
        _s_chat_proposed = anchor_map_proposed._s_chat;

        if( !anchor_map_previous || _s_chat_previous !== _s_chat_proposed){
            s_chat_proposed = anchor_map_proposed.chat;
            switch( s_chat_proposed ){
                case 'opened':
                    is_ok = spa.chat.setSliderPostion('opened');
                break;
                case 'closed':
                    is_ok = spa.chat.setSliderPostion('closed');
                break;
                default:
                    toggleChat( false );
                    delete anchor_map_proposed.chat;
                    $.uriAnchor.setAnchor( anchor_map_proposed, null, true );
            }
        } 
        if(is_ok){
            if(anchor_map_previous){
                $.uriAnchor.setAnchor(anchor_map_previous, null, true);
                stateMap.anchor_map = anchor_map_previous;
            }else{
                delete anchor_map_proposed.chat;
                $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
            }
        }
        return false;
    };
    toggleChat = function(do_extend, callback){
        var 
        px_chat_ht = jqueryMap.$chat.height(),
        is_open = px_chat_ht === configMap.chat_extend_height,
        is_closed = px_chat_ht === configMap.chat_retract_height,
        is_sliding = !is_open && !is_closed;
        if(is_sliding){
            return false;
        }
        if(do_extend){
            jqueryMap.$chat.animate({
                height: configMap.chat_extend_height
            }, configMap.chat_extend_time,function(){
                jqueryMap.$chat.attr({
                    'title': configMap.chat_extend_title
                })
                stateMap.is_chat_retracted = false;
                if(callback){
                    callback(jqueryMap.$chat)
                }
            })
            return true;
        }
        jqueryMap.$chat.animate({
            height: configMap.chat_retract_height
        }, configMap.chat_retract_time,function(){
            jqueryMap.$chat.attr({
                'title': configMap.chat_retract_title
            })
            stateMap.is_chat_retracted = true;
            if(callback){
                callback(jqueryMap.$chat)
            }
        })
        return true;
    }
    onClickChat = function(event){
        changeAnchorPart({
            chat: (stateMap.is_chat_retracted ? 'open' : 'closed')
        });
        return false;
    }
    initModule = function( $container ){
       stateMap.$container  = $container;
       $container.html(configMap.main_html);
       setJqueryMap(); 
       
       $.uriAnchor.configModule({
           schema_map : configMap.anchor_schema_map
       })
       spa.chat.configModule({
           set_chat_anchor: setChatAnchor,
           chat_model : spa.model.chat,
           people_model : spa.model.people
       });
       spa.chat.initModule(jqueryMap.$container);
       $(window).bind( 'hashchange', onHashchange ).trigger( 'hashchange' )
    }
    return {initModule: initModule}
}())
