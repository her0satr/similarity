Ext.define('Stiki.view.Sidebar' ,{
    extend: 'Ext.panel.Panel',
    alias : 'widget.sidebar',
    collapsible: true,
    collapseDirection: 'left',
    layout: 'fit',
	
    initComponent: function() {
        Ext.applyIf( this, { items: [this.createView()] });
        this.addEvents( 'menuselect' );
        this.callParent(arguments);
    },
	
    createView: function(){
		var me = this;
		var ArrayGroup = [];
		var Menu = this.menu;
		
		for (var i = 0; i < Menu.length; i++) {
			var item = Ext.create('Ext.Panel', { title: Menu[i].Title });
			for (var j = 0; j < Menu[i].Child.length; j++) {
				item.add({
					xtype: 'button', cls: 'x-btn-menu', text: Menu[i].Child[j].Title, link: Menu[i].Child[j].Link,
					width: 200, textAlign: 'left', padding: 5, handler: function() {
						me.ShowActiveTab(this.text, this.link)
					}
				});
			}
			
			ArrayGroup.push(item);
		}
		
		this.view = Ext.create('Ext.Panel', {
			region: 'west', split: true, width: 210, layout: 'accordion', items: ArrayGroup
		});
		
		return this.view;
    },
	ShowActiveTab: function(title, link) {
		this.fireEvent('menuselect', this, title, link);
	}
});
