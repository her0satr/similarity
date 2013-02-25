Ext.Loader.setConfig({
    enabled: true,
    paths: {
        'Ext.ux': URLS.ext + '/examples/ux',
        'Ext': URLS.ext + '/src',
        'Stiki': URLS.app
    }
});

Ext.require([
	'Stiki.controller.Home',
	'Stiki.view.Sidebar',
	'Stiki.view.MainPanel',
	'Stiki.view.Login',
]);

Ext.application({
    name: 'Stiki',
    appFolder: URLS.app,
    autoCreateViewport: false,
    
    controllers: [
        'Home',
    ],
    
    launch: function() {
        Ext.get('loading').destroy();
        Ext.create('Ext.container.Viewport', {
            layout:'border',
            border:0,
            items:[{xtype:'loginpage',region:'center'}]
        });
    }
    
});
