Ext.define('Stiki.controller.Home', {
    extend: 'Ext.app.Controller',
    loggedIn: false,
    views: [ 'Sidebar', 'MainPanel', 'Login' ],
	
    init: function() {
        this.control({
            'viewport': {
                render: this.onViewportRender
            },
            'loginwindow button[name=loginButton]': {
                click: this.onLoginButton
            },
            'loginwindow form field' : {
                specialkey: this.onFieldSpecialKey
            },
            'sidebar' : {
                menuselect: this.onMenuSelect
            }
        });
    },
    
    onViewportRender: function(vp) {
        if (this.loggedIn)
            return;
        
        var me = this;
        var con = new Ext.data.Connection();
        con.on( 'beforerequest', function(){ Ext.getBody().mask( 'please wait...' ) } );
        con.on( 'requestcomplete', function(){ Ext.getBody().unmask() } );
        con.on( 'requestexception', function(){ Ext.getBody().unmask() } );
        con.request({
            url: URLS.stiki + '/index.php/common/check',
            method:'POST',
            success:function(response, opts) {
                var obj = Ext.JSON.decode(response.responseText);
                me.loggedIn = true;
                me.setViewportLayout(obj.menu)
            },
            failure:function(response,opts){
                Ext.ComponentQuery.query('loginwindow')[0].show();
            }
        });
    },
    
    onFieldSpecialKey: function( t, ev ) {
        var form = t.up( 'form' ).getForm(),
            fields = form.getFields(),
            key = null;
            
        if ( ev.getKey() == ev.ENTER ) {
            key = fields.indexOfKey( t.id );
            if ( key != null && key < fields.items.length - 1 ) {
                fields.items[key].fireEvent( 'blur', t );
                fields.items[key + 1].focus( true, true );
            } else {
                this.onLoginButton();
            }
        }
    },

    onLoginButton: function(button, ev) {
        var form = Ext.ComponentQuery.query('loginwindow form')[0],
            me = this;
		
        form.submit({
            waitTitle: 'Harap tunggu:',
            waitMsg: 'Loading...',
            success: function(form, action) {
				me.loggedIn = true;
				me.setViewportLayout(action.result.menu);
            },
            failure: function(form, action) {
                Ext.Msg.alert( 'Gagal:', action.result.text );
            }
        });
    },
    
    setViewportLayout: function(menu) {
        Ext.ComponentQuery.query('loginwindow')[0].destroy();
        Ext.ComponentQuery.query('viewport')[0].destroy();
        Ext.create('Ext.container.Viewport', {
            layout:'border',
            border:0,
            items: [
                { xtype:'container', region:'north', height:60, layout:'fit', html:Ext.get('header').dom.innerHTML, baseCls: 'content-header' },
                { xtype:'mainpanel', region:'center', layout:'fit', id: 'MainPanel' },
                { xtype:'sidebar', id: 'SidebarKu', region:'west', width: 200, menu: menu, title:'Navigasi'},
                { xtype:'container', applyTo:'footer', region:'south', height:30, layout:'fit', html:Ext.get('footer').dom.innerHTML, baseCls: 'content-footer'}
            ]
        });
    },
	
    onMenuSelect: function(panel, title, link) {
        var tabs = Ext.ComponentQuery.query( 'mainpanel' )[0],
            created = false;
            
        tabs.items.each( function( e ) {
            if ( e.url == link ) {
                created = e;
                return;
            }
        });
        
        if ( ! created ) {
            created = Ext.create('Stiki.view.ContentTab', {url:link, title:title, closable: true});
            created.load();
            tabs.add(created);
        }
        
        tabs.setActiveTab( created );
    }

});