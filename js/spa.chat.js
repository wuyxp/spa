spa.chat = (function(){
    var 
    configMap = {
        main_html : ''
            + '<h1>hollo world</h1>',
        settable_map : {}
    },
    stateMap = { $container : null },
    jqueryMap = {},
    setJqueryMap, configModule, initModule;
    setJqueryMap = function (){
        var $container = stateMap.$container;
        jqueryMap = {$container : $container};  
    }
    configModule = function (input_map){
        spa.util.setConfigMap({
            input_map : input_map,
            settable : configMap.settable_map,
            config_map : configMap
        });
        return true;
    }
    initModule = function( $container ){
        $container.html( configMap.main_html );
        stateMap.$container = $container;
        setJqueryMap();
        return true;
    }
    return {
        configModule : configModule,
        initModule : initModule
    }
}())