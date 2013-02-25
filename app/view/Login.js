Ext.define('Stiki.view.Login' ,{
    extend: 'Ext.container.Container',
    alias : 'widget.loginpage',
	
    initComponent: function() {
        Ext.applyIf(this, {
            items: [{ xtype: 'loginwindow' }]
        });
        this.callParent(arguments);
    }
});

Ext.define( 'Stiki.view.LoginWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.loginwindow',
    y: 106,
    width: 300,
    height: 150,
    closable: false,
    draggable: false,
    layout: 'anchor',
    
    initComponent: function() {
        Ext.apply(this, {
            items: [{ 
                xtype: 'form',
                url: URLS.stiki + '/index.php/common/',
                border: 0,
                bodyStyle: 'padding: 10px;',
                defaultType: 'textfield',
                items: [{
                    xtype:'container',
                    html: '<div id="loginmsg" style="padding: 10px 0 0 0;"><p>Masukkan username/password untuk login</p></div>'
                },{
                    name: 'username',
                    fieldLabel: 'Username',
                    required:true
                },{
                    name: 'password',
                    fieldLabel: 'Password',
                    inputType: 'password',
                    required:true
                }]
            }],
            buttons: [ { name: 'loginButton', text: 'Login' } ]
        });
        this.callParent(arguments);
    }
});
