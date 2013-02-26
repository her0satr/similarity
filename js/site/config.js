Ext.Loader.setConfig({
	enabled: true,
    paths: {
        'Ext': Web.HOST + '/extjs/src',
        'Ext.ux': Web.HOST + '/extjs/examples/ux'
    }
});
Ext.require([ 'Ext.ux.grid.FiltersFeature' ]);

Ext.onReady(function() {
    Ext.QuickTips.init();
    Ext.get('loading_mask').destroy();
	
	var ConfigStore = Ext.create('Ext.data.Store', {
		model: 'Config', autoLoad: true, pageSize: 25, remoteSort: true,
        sorters: [{ property: 'config_name', direction: 'ASC' }],
		fields: [ 'config_id', 'config_name', 'config_content', 'config_hidden', 'config_update' ],
		proxy: {
			type: 'ajax', extraParams: { hidden: 0 },
			url : Web.HOST + '/index.php/site/config/grid', actionMethods: { read: 'POST' },
			reader: { type: 'json', root: 'rows', totalProperty: 'totalCount' }
		}
	});
    
	var ConfigGrid = Ext.create('Ext.grid.Panel', {
		viewConfig: { forceFit: true }, store: ConfigStore, height: 400, renderTo: Ext.get('grid-member'),
		features: [{ ftype: 'filters', encode: true, local: false }], layout: 'fit',
		columns: [ {
				header: 'Config Name', dataIndex: 'config_name', sortable: true, filter: true, width: 200
		}, {	header: 'Content', dataIndex: 'config_content', sortable: true, filter: true, width: 100, flex: 1
		} ],
		tbar: [ {
				text: 'Tambah', iconCls: 'addIcon', tooltip: 'Tambah Config', handler: function() { CallWin({ config_id: 0 }); }
			}, '-', {
				text: 'Ubah', iconCls: 'editIcon', tooltip: 'Ubah Config', handler: function() { ConfigGrid.Update({ }); }
			}, '-', {
				text: 'Hapus', iconCls: 'delIcon', tooltip: 'Hapus Config', handler: function() {
					if (ConfigGrid.getSelectionModel().getSelection().length == 0) {
						Ext.Msg.alert('Information', 'Please choose record.');
						return false;
					}
					
					Ext.MessageBox.confirm('Confirmation', 'Are you sure ?', ConfigGrid.Delete);
				}
			}, '->', {
                id: 'SearchPM', xtype: 'textfield', emptyText: 'Search', width: 80, listeners: {
                    'specialKey': function(field, el) {
                        if (el.getKey() == Ext.EventObject.ENTER) {
                            var value = Ext.getCmp('SearchPM').getValue();
                            if ( value ) {
								ConfigGrid.LoadGrid({});
                            }
                        }
                    }
                }
            }, '-', {
				text: 'Reset', tooltip: 'Reset search', iconCls: 'refreshIcon', handler: function() {
					ConfigGrid.LoadGrid({ Reset: 1 });
				}
		} ],
		bbar: new Ext.PagingToolbar( {
			store: ConfigStore, displayInfo: true,
			displayMsg: 'Displaying topics {0} - {1} of {2}',
			emptyMsg: 'No topics to display'
		} ),
		listeners: {
			'itemdblclick': function(model, records) {
				ConfigGrid.Update({ });
            }
        },
		LoadGrid: function(Param) {
			Param.Reset = (Param.Reset == null) ? 0 : Param.Reset;
			
			// Set Extra Param
			ConfigStore.proxy.extraParams.NameLike = Ext.getCmp('SearchPM').getValue();
			
			if (Param.Reset == 1) {
				delete ConfigStore.proxy.extraParams.NameLike;
			}
			
			ConfigStore.load();
		},
		Update: function(Param) {
			var Data = ConfigGrid.getSelectionModel().getSelection();
			if (Data.length == 0) {
				Ext.Msg.alert('Information', 'Please choose record.');
				return false;
			}
			
			Ext.Ajax.request({
				url: Web.HOST + '/index.php/site/config/action',
				params: { Action: 'GetConfigByID', config_id: Data[0].data.config_id },
				success: function(Result) {
					eval('var Record = ' + Result.responseText)
					CallWin(Record);
				}
			});
		},
		Delete: function(Value) {
			if (Value == 'no') {
				return;
			}
			
			Ext.Ajax.request({
				url: Web.HOST + '/index.php/site/config/action',
				params: { Action: 'DeteleConfigByID', config_id: ConfigGrid.getSelectionModel().getSelection()[0].data.config_id },
				success: function(TempResult) {
					eval('var Result = ' + TempResult.responseText)
					
					Renderer.FlashMessage(Result.Message);
					if (Result.QueryStatus == '1') {
						ConfigStore.load();
					}
				}
			});
		}
	});
	
	function CallWin(Config) {
		var WinConfig = new Ext.Window({
			layout: 'fit', width: 675, height: 405,
			closeAction: 'hide', plain: true, modal: true,
			buttons: [ {
						text: 'Save', handler: function() { WinConfig.Save(); }
				}, {	text: 'Close', handler: function() {
						WinConfig.hide();
				}
			}],
			listeners: {
				show: function(w) {
					var Title = (Config.config_id == 0) ? 'Entry Config - [New]' : 'Entry Config - [Edit]';
					w.setTitle(Title);
					
					Ext.Ajax.request({
						url: Web.HOST + '/index.php/site/config/view/',
						success: function(Result) {
							w.body.dom.innerHTML = Result.responseText;
							
							WinConfig.config_id = Config.config_id;
							WinConfig.config_name = new Ext.form.TextField({ renderTo: 'config_nameED', width: 575, allowBlank: false, blankText: 'Name cannot be empty' });
							WinConfig.config_content = new Ext.form.HtmlEditor({ renderTo: 'configED', width: 575, height: 300, enableFont: false })
							
							// Populate Record
							if (Config.config_id > 0) {
								WinConfig.config_name.setValue(Config.config_name);
								WinConfig.config_content.setValue(Config.config_content);
							}
						}
					});
				},
				hide: function(w) {
					w.destroy();
					w = WinConfig = null;
				}
			},
			Save: function() {
				var Param = new Object();
				Param.Action = 'UpdateConfig';
				Param.config_id = WinConfig.config_id;
				Param.config_name = WinConfig.config_name.getValue();
				Param.config_content = WinConfig.config_content.getValue();
				
				// Validation
				var Validation = true;
				if (! WinConfig.config_name.validate()) {
					Validation = false;
				}
				if (! Validation) {
					return;
				}
				
				Ext.Ajax.request({
					params: Param,
					url: Web.HOST + '/index.php/site/config/action',
					success: function(TempResult) {
						eval('var Result = ' + TempResult.responseText);
						Renderer.FlashMessage(Result.Message);
                        
                        if (Result.QueryStatus == '1') {
							ConfigStore.load();
							WinConfig.hide();
                        }
					}
				});
			}
		});
		WinConfig.show();
	}
	
	Renderer.InitWindowSize({ Panel: -1, Grid: ConfigGrid, Toolbar: 70 });
    Ext.EventManager.onWindowResize(function() {
		Renderer.InitWindowSize({ Panel: -1, Grid: ConfigGrid, Toolbar: 70 });
    }, ConfigGrid);
});