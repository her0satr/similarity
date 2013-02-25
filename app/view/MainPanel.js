
Ext.define( 'Stiki.view.MainPanel', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.mainpanel',
    region: 'center',
    activeTab: 0,
    defaults: { padding: '10px' },
    initComponent: function() {
        Ext.apply( this, {
            items: [{
                title: 'Home',
				loader: { url: 'index.php/dashboard/', contentType: 'html', autoLoad: true }
            }]
        });
        this.callParent(arguments);
    }
});

Ext.define('Stiki.view.ContentTab', {
    extend: 'Ext.container.Container',
    alias: 'widget.contenttab',
    layout: 'fit',
    url: '',
    base: URLS.stiki,

    initComponent: function() {
        this.tpl = new Ext.XTemplate('<iframe style="width: 100%; height: 100%; border: 0; margin:0; padding:0;" src="{base}{url}"></iframe>');
        this.callParent(arguments);
    },

    load: function() {
        this.update(this.tpl.apply(this));
    },

    clear: function() {
        this.update('');
    }
});
