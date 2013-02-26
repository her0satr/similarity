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
	
	var ItemStore = Ext.create('Ext.data.Store', {
		autoLoad: true, pageSize: 25, remoteSort: true,
        sorters: [{ property: 'movie_title', direction: 'ASC' }],
		fields: [ 'item_id', 'movie_title', 'release_date', 'video_release_date', 'imdb_url' ],
		proxy: {
			type: 'ajax', extraParams: { },
			url : Web.HOST + '/index.php/similarity/item/grid', actionMethods: { read: 'POST' },
			reader: { type: 'json', root: 'rows', totalProperty: 'totalCount' }
		}
	});
    
	var ItemGrid = Ext.create('Ext.grid.Panel', {
		viewItem: { forceFit: true }, store: ItemStore, height: 400, renderTo: Ext.get('grid-member'),
		features: [{ ftype: 'filters', encode: true, local: false }], layout: 'fit',
		columns: [ {
				header: 'Title', dataIndex: 'movie_title', sortable: true, filter: true, width: 150, flex: 1
		}, {	header: 'Release Date', dataIndex: 'release_date', sortable: true, filter: true, width: 125, renderer: Ext.util.Format.dateRenderer(DATE_FORMAT)
		}, {	header: 'Video Release Date', dataIndex: 'video_release_date', sortable: true, filter: true, width: 125
		}, {	header: 'IMDB Url', dataIndex: 'imdb_url', sortable: true, filter: true, width: 400
		} ],
		tbar: [
			/*
			{
				text: 'Add', iconCls: 'addIcon', tooltip: 'Add Item', handler: function() { CallWin({ item_id: 0 }); }
			}, '-', {
				text: 'Update', iconCls: 'editIcon', tooltip: 'Update Item', handler: function() { ItemGrid.Update({ }); }
			}, '-', {
				text: 'Delete', iconCls: 'delIcon', tooltip: 'Delete Item', handler: function() {
					if (ItemGrid.getSelectionModel().getSelection().length == 0) {
						Ext.Msg.alert('Information', 'Please choose record.');
						return false;
					}
					
					Ext.MessageBox.confirm('Confirmation', 'Are you sure ?', ItemGrid.Delete);
				}
			},
			/*	*/
			'->', {
                id: 'SearchPM', xtype: 'textfield', emptyText: 'Search', width: 80, listeners: {
                    'specialKey': function(field, el) {
                        if (el.getKey() == Ext.EventObject.ENTER) {
                            var value = Ext.getCmp('SearchPM').getValue();
                            if ( value ) {
								ItemGrid.LoadGrid({});
                            }
                        }
                    }
                }
            }, '-', {
				text: 'Reset', tooltip: 'Reset search', iconCls: 'refreshIcon', handler: function() {
					ItemGrid.LoadGrid({ Reset: 1 });
				}
		} ],
		bbar: new Ext.PagingToolbar( {
			store: ItemStore, displayInfo: true,
			displayMsg: 'Displaying topics {0} - {1} of {2}',
			emptyMsg: 'No topics to display'
		} ),
		listeners: {
			'itemdblclick': function(model, records) {
//				ItemGrid.Update({ });
            }
        },
		LoadGrid: function(Param) {
			Param.Reset = (Param.Reset == null) ? 0 : Param.Reset;
			
			// Set Extra Param
			ItemStore.proxy.extraParams.NameLike = Ext.getCmp('SearchPM').getValue();
			
			if (Param.Reset == 1) {
				delete ItemStore.proxy.extraParams.nameLike;
			}
			
			ItemStore.load();
		},
		Update: function(Param) {
			var Data = ItemGrid.getSelectionModel().getSelection();
			if (Data.length == 0) {
				Ext.Msg.alert('Information', 'Please choose record.');
				return false;
			}
			
			Ext.Ajax.request({
				url: Web.HOST + '/index.php/similarity/item/action',
				params: { Action: 'GetItemByID', item_id: Data[0].data.item_id },
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
				url: Web.HOST + '/index.php/similarity/item/action',
				params: { Action: 'DeteleItemByID', item_id: ItemGrid.getSelectionModel().getSelection()[0].data.item_id },
				success: function(TempResult) {
					eval('var Result = ' + TempResult.responseText)
					
					Renderer.FlashMessage(Result.Message);
					if (Result.QueryStatus == '1') {
						ItemStore.load();
					}
				}
			});
		}
	});
	
	function CallWin(Param) {
		var WinItem = new Ext.Window({
			layout: 'fit', width: 390, height: 425,
			closeAction: 'hide', plain: true, modal: true,
			buttons: [ {
						text: 'Save', handler: function() { WinItem.Save(); }
				}, {	text: 'Close', handler: function() {
						WinItem.hide();
				}
			}],
			listeners: {
				show: function(w) {
					var Title = (Param.item_id == 0) ? 'Entry Item - [New]' : 'Entry Item - [Edit]';
					w.setTitle(Title);
					
					Ext.Ajax.request({
						url: Web.HOST + '/index.php/similarity/item/view/',
						success: function(Result) {
							w.body.dom.innerHTML = Result.responseText;
							
							WinItem.item_id = Param.item_id;
							WinItem.agent = Combo.Class.Agent({
								renderTo: 'agentED', width: 245, allowBlank: false, blankText: 'Agent cannot be empty', listeners: {
									select: function(combo, record, eOpt) {
										WinItem.route.reset();
										WinItem.route_cost.reset();
									}
								}
							});
							WinItem.item_sender = new Ext.form.TextField({ renderTo: 'item_senderED', width: 245, allowBlank: false, blankText: 'Sender cannot be empty' });
							WinItem.item_category = Combo.Class.ItemCategory({ renderTo: 'item_categoryED', width: 245, allowBlank: false, blankText: 'Item Category cannot be empty' });
							WinItem.movie_title = new Ext.form.TextField({ renderTo: 'movie_titleED', width: 245, readOnly: true, allowBlank: false, blankText: 'AWB cannot be empty' });
							WinItem.item_volume = new Ext.form.TextField({ renderTo: 'item_volumeED', width: 245, allowBlank: false, blankText: 'Volume cannot be empty' });
							WinItem.item_weight = new Ext.form.TextField({ renderTo: 'item_weightED', width: 245, allowBlank: false, blankText: 'Weight cannot be empty' });
							WinItem.item_dest = new Ext.form.TextArea({ renderTo: 'item_destED', width: 245, height: 70, allowBlank: false, blankText: 'Address Destination cannot be empty' });
							WinItem.route = Combo.Class.Route({
								renderTo: 'routeED', width: 245, allowBlank: false, blankText: 'Gateway Destination cannot be empty', listeners: {
									beforequery: function(queryEvent, eOpts) {
										var val = WinItem.agent.getValue();
										var record = WinItem.agent.store.findRecord('agent_id', val);
										
										queryEvent.combo.store.proxy.extraParams.gateway_from = record.data.gateway_id;
										queryEvent.combo.store.load();
									},
									select: function(combo, record, eOpt) {
										Ext.Ajax.request({
											params: {
												Action: 'GetRouteCost',
												route_id: record[0].data.route_id,
												item_category_id: WinItem.item_category.getValue(),
												volume: WinItem.item_volume.getValue(),
												weight: WinItem.item_weight.getValue()
											},
											url: Web.HOST + '/index.php/route/route_detail/action/',
											success: function(TempResult) {
												eval('var Result = ' + TempResult.responseText);
												if (Result.route_cost != null) {
													WinItem.route_cost.setValue(Result.route_cost);
													WinItem.route_detail.setValue(Result.route_detail_id);
												}
											}
										});
									}
								}
							});
							WinItem.route_detail = new Ext.form.Hidden({ renderTo: 'route_detailED' });
							WinItem.route_cost = new Ext.form.TextField({ renderTo: 'route_costED', width: 245, readOnly: true, allowBlank: false, blankText: 'Cost cannot be empty' });
							WinItem.item_status = Combo.Class.ItemStatus({ renderTo: 'item_statusED', width: 245, readOnly: true });
							WinItem.item_status.setReadOnly(true);
							
							if (Param.item_id > 0) {
								WinItem.item_sender.setValue(Param.item_sender);
								WinItem.item_sender.setValue(Param.item_sender);
								WinItem.movie_title.setValue(Param.movie_title);
								WinItem.item_volume.setValue(Param.item_volume);
								WinItem.item_weight.setValue(Param.item_weight);
								WinItem.item_dest.setValue(Param.item_dest);
								WinItem.route_cost.setValue(Param.route_cost);
								WinItem.route_detail.setValue(Param.route_detail_id);
								WinItem.item_status.setValue(Param.item_status_id);
								
								Func.SetValue({ Action : 'Agent', ForceID: Param.agent_id, Combo: WinItem.agent });
								Func.SetValue({ Action : 'ItemCategory', ForceID: Param.item_category_id, Combo: WinItem.item_category });
								Func.SetValue({ Action : 'Route', ForceID: Param.route_id, Combo: WinItem.route });
							} else {
								Func.SetValue({ Action : 'Agent', ForceID: Agent.agent_id, Combo: WinItem.agent });
								Ext.Ajax.request({
									params: { Action: 'GetAwb' },
									url: Web.HOST + '/index.php/similarity/item/action/',
									success: function(TempResult) {
										eval('var Result = ' + TempResult.responseText);
										WinItem.movie_title.setValue(Result.UniqueID);
									}
								});
							}
							
							if (Agent.agent_id != null) {
								WinItem.agent.setReadOnly(true);
							}
						}
					});
				},
				hide: function(w) {
					w.destroy();
					w = WinItem = null;
				}
			},
			Save: function() {
				var Param = new Object();
				Param.Action = 'UpdateItem';
				Param.item_id = WinItem.item_id;
				Param.item_category_id = WinItem.item_category.getValue();
				Param.route_id = WinItem.route.getValue();
				Param.agent_id = WinItem.agent.getValue();
				Param.item_sender = WinItem.item_sender.getValue();
				Param.movie_title = WinItem.movie_title.getValue();
				Param.item_volume = WinItem.item_volume.getValue();
				Param.item_weight = WinItem.item_weight.getValue();
				Param.item_dest = WinItem.item_dest.getValue();
				Param.route_cost = WinItem.route_cost.getValue();
				Param.route_detail_id = WinItem.route_detail.getValue();
				
				// Validation
				var Validation = true;
				if (! WinItem.item_sender.validate()) {
					Validation = false;
				}
				if (! WinItem.item_category.validate()) {
					Validation = false;
				}
				if (! WinItem.movie_title.validate()) {
					Validation = false;
				}
				if (! WinItem.item_volume.validate()) {
					Validation = false;
				}
				if (! WinItem.item_weight.validate()) {
					Validation = false;
				}
				if (! WinItem.item_dest.validate()) {
					Validation = false;
				}
				if (! WinItem.route.validate()) {
					Validation = false;
				}
				if (! WinItem.route_cost.validate()) {
					Validation = false;
				}
				if (! Validation) {
					return;
				}
				
				Ext.Ajax.request({
					params: Param,
					url: Web.HOST + '/index.php/similarity/item/action',
					success: function(TempResult) {
						eval('var Result = ' + TempResult.responseText);
						Renderer.FlashMessage(Result.Message);
                        
                        if (Result.QueryStatus == '1') {
							ItemStore.load();
							WinItem.hide();
                        }
					}
				});
			}
		});
		WinItem.show();
	}
	
	Renderer.InitWindowSize({ Panel: -1, Grid: ItemGrid, Toolbar: 70 });
    Ext.EventManager.onWindowResize(function() {
		Renderer.InitWindowSize({ Panel: -1, Grid: ItemGrid, Toolbar: 70 });
    }, ItemGrid);
});