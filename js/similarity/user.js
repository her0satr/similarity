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
	
	var UserStore = Ext.create('Ext.data.Store', {
		autoLoad: true, pageSize: 25, remoteSort: true,
        sorters: [{ property: 'occupation', direction: 'ASC' }],
		fields: [ 'user_id', 'username', 'password', 'age', 'gender', 'occupation', 'zipcode' ],
		proxy: {
			type: 'ajax', extraParams: { },
			url : Web.HOST + '/index.php/similarity/user/grid', actionMethods: { read: 'POST' },
			reader: { type: 'json', root: 'rows', totalProperty: 'totalCount' }
		}
	});
    
	var UserGrid = Ext.create('Ext.grid.Panel', {
		viewUser: { forceFit: true }, store: UserStore, height: 400, renderTo: Ext.get('grid-member'),
		features: [{ ftype: 'filters', encode: true, local: false }], layout: 'fit',
		columns: [ {
				header: 'Age', dataIndex: 'age', sortable: true, filter: true, width: 150
		}, {	header: 'Gender', dataIndex: 'gender', sortable: true, filter: true, width: 100
		}, {	header: 'Occupation', dataIndex: 'occupation', sortable: true, filter: true, width: 300, flex: 1
		}, {	header: 'Zipcode', dataIndex: 'zipcode', sortable: true, filter: true, width: 100
		} ],
		tbar: [
			/*
			{
				text: 'Add', iconCls: 'addIcon', tooltip: 'Add User', handler: function() { CallWin({ user_id: 0 }); }
			}, '-', {
				text: 'Update', iconCls: 'editIcon', tooltip: 'Update User', handler: function() { UserGrid.Update({ }); }
			}, '-', {
				text: 'Delete', iconCls: 'delIcon', tooltip: 'Delete User', handler: function() {
					if (UserGrid.getSelectionModel().getSelection().length == 0) {
						Ext.Msg.alert('Information', 'Please choose record.');
						return false;
					}
					
					Ext.MessageBox.confirm('Confirmation', 'Are you sure ?', UserGrid.Delete);
				}
			},
			/*	*/
			'->', {
                id: 'SearchPM', xtype: 'textfield', emptyText: 'Search', width: 80, listeners: {
                    'specialKey': function(field, el) {
                        if (el.getKey() == Ext.EventObject.ENTER) {
                            var value = Ext.getCmp('SearchPM').getValue();
                            if ( value ) {
								UserGrid.LoadGrid({});
                            }
                        }
                    }
                }
            }, '-', {
				text: 'Reset', tooltip: 'Reset search', iconCls: 'refreshIcon', handler: function() {
					UserGrid.LoadGrid({ Reset: 1 });
				}
		} ],
		bbar: new Ext.PagingToolbar( {
			store: UserStore, displayInfo: true,
			displayMsg: 'Displaying topics {0} - {1} of {2}',
			emptyMsg: 'No topics to display'
		} ),
		listeners: {
			'itemdblclick': function(model, records) {
//				UserGrid.Update({ });
            }
        },
		LoadGrid: function(Param) {
			Param.Reset = (Param.Reset == null) ? 0 : Param.Reset;
			
			// Set Extra Param
			UserStore.proxy.extraParams.NameLike = Ext.getCmp('SearchPM').getValue();
			
			if (Param.Reset == 1) {
				delete UserStore.proxy.extraParams.nameLike;
			}
			
			UserStore.load();
		},
		Update: function(Param) {
			var Data = UserGrid.getSelectionModel().getSelection();
			if (Data.length == 0) {
				Ext.Msg.alert('Information', 'Please choose record.');
				return false;
			}
			
			Ext.Ajax.request({
				url: Web.HOST + '/index.php/similarity/user/action',
				params: { Action: 'GetUserByID', user_id: Data[0].data.user_id },
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
				url: Web.HOST + '/index.php/similarity/user/action',
				params: { Action: 'DeteleUserByID', user_id: UserGrid.getSelectionModel().getSelection()[0].data.user_id },
				success: function(TempResult) {
					eval('var Result = ' + TempResult.responseText)
					
					Renderer.FlashMessage(Result.Message);
					if (Result.QueryStatus == '1') {
						UserStore.load();
					}
				}
			});
		}
	});
	
	function CallWin(Param) {
		var WinUser = new Ext.Window({
			layout: 'fit', width: 390, height: 425,
			closeAction: 'hide', plain: true, modal: true,
			buttons: [ {
						text: 'Save', handler: function() { WinUser.Save(); }
				}, {	text: 'Close', handler: function() {
						WinUser.hide();
				}
			}],
			listeners: {
				show: function(w) {
					var Title = (Param.user_id == 0) ? 'Entry User - [New]' : 'Entry User - [Edit]';
					w.setTitle(Title);
					
					Ext.Ajax.request({
						url: Web.HOST + '/index.php/similarity/user/view/',
						success: function(Result) {
							w.body.dom.innerHTML = Result.responseText;
							
							WinUser.user_id = Param.user_id;
							WinUser.agent = Combo.Class.Agent({
								renderTo: 'agentED', width: 245, allowBlank: false, blankText: 'Agent cannot be empty', listeners: {
									select: function(combo, record, eOpt) {
										WinUser.route.reset();
										WinUser.route_cost.reset();
									}
								}
							});
							WinUser.user_sender = new Ext.form.TextField({ renderTo: 'user_senderED', width: 245, allowBlank: false, blankText: 'Sender cannot be empty' });
							WinUser.user_category = Combo.Class.UserCategory({ renderTo: 'user_categoryED', width: 245, allowBlank: false, blankText: 'User Category cannot be empty' });
							WinUser.movie_title = new Ext.form.TextField({ renderTo: 'movie_titleED', width: 245, readOnly: true, allowBlank: false, blankText: 'AWB cannot be empty' });
							WinUser.user_volume = new Ext.form.TextField({ renderTo: 'user_volumeED', width: 245, allowBlank: false, blankText: 'Volume cannot be empty' });
							WinUser.user_weight = new Ext.form.TextField({ renderTo: 'user_weightED', width: 245, allowBlank: false, blankText: 'Weight cannot be empty' });
							WinUser.user_dest = new Ext.form.TextArea({ renderTo: 'user_destED', width: 245, height: 70, allowBlank: false, blankText: 'Address Destination cannot be empty' });
							WinUser.route = Combo.Class.Route({
								renderTo: 'routeED', width: 245, allowBlank: false, blankText: 'Gateway Destination cannot be empty', listeners: {
									beforequery: function(queryEvent, eOpts) {
										var val = WinUser.agent.getValue();
										var record = WinUser.agent.store.findRecord('agent_id', val);
										
										queryEvent.combo.store.proxy.extraParams.gateway_from = record.data.gateway_id;
										queryEvent.combo.store.load();
									},
									select: function(combo, record, eOpt) {
										Ext.Ajax.request({
											params: {
												Action: 'GetRouteCost',
												route_id: record[0].data.route_id,
												user_category_id: WinUser.user_category.getValue(),
												volume: WinUser.user_volume.getValue(),
												weight: WinUser.user_weight.getValue()
											},
											url: Web.HOST + '/index.php/route/route_detail/action/',
											success: function(TempResult) {
												eval('var Result = ' + TempResult.responseText);
												if (Result.route_cost != null) {
													WinUser.route_cost.setValue(Result.route_cost);
													WinUser.route_detail.setValue(Result.route_detail_id);
												}
											}
										});
									}
								}
							});
							WinUser.route_detail = new Ext.form.Hidden({ renderTo: 'route_detailED' });
							WinUser.route_cost = new Ext.form.TextField({ renderTo: 'route_costED', width: 245, readOnly: true, allowBlank: false, blankText: 'Cost cannot be empty' });
							WinUser.user_status = Combo.Class.UserStatus({ renderTo: 'user_statusED', width: 245, readOnly: true });
							WinUser.user_status.setReadOnly(true);
							
							if (Param.user_id > 0) {
								WinUser.user_sender.setValue(Param.user_sender);
								WinUser.user_sender.setValue(Param.user_sender);
								WinUser.movie_title.setValue(Param.movie_title);
								WinUser.user_volume.setValue(Param.user_volume);
								WinUser.user_weight.setValue(Param.user_weight);
								WinUser.user_dest.setValue(Param.user_dest);
								WinUser.route_cost.setValue(Param.route_cost);
								WinUser.route_detail.setValue(Param.route_detail_id);
								WinUser.user_status.setValue(Param.user_status_id);
								
								Func.SetValue({ Action : 'Agent', ForceID: Param.agent_id, Combo: WinUser.agent });
								Func.SetValue({ Action : 'UserCategory', ForceID: Param.user_category_id, Combo: WinUser.user_category });
								Func.SetValue({ Action : 'Route', ForceID: Param.route_id, Combo: WinUser.route });
							} else {
								Func.SetValue({ Action : 'Agent', ForceID: Agent.agent_id, Combo: WinUser.agent });
								Ext.Ajax.request({
									params: { Action: 'GetAwb' },
									url: Web.HOST + '/index.php/similarity/user/action/',
									success: function(TempResult) {
										eval('var Result = ' + TempResult.responseText);
										WinUser.movie_title.setValue(Result.UniqueID);
									}
								});
							}
							
							if (Agent.agent_id != null) {
								WinUser.agent.setReadOnly(true);
							}
						}
					});
				},
				hide: function(w) {
					w.destroy();
					w = WinUser = null;
				}
			},
			Save: function() {
				var Param = new Object();
				Param.Action = 'UpdateUser';
				Param.user_id = WinUser.user_id;
				Param.user_category_id = WinUser.user_category.getValue();
				Param.route_id = WinUser.route.getValue();
				Param.agent_id = WinUser.agent.getValue();
				Param.user_sender = WinUser.user_sender.getValue();
				Param.movie_title = WinUser.movie_title.getValue();
				Param.user_volume = WinUser.user_volume.getValue();
				Param.user_weight = WinUser.user_weight.getValue();
				Param.user_dest = WinUser.user_dest.getValue();
				Param.route_cost = WinUser.route_cost.getValue();
				Param.route_detail_id = WinUser.route_detail.getValue();
				
				// Validation
				var Validation = true;
				if (! WinUser.user_sender.validate()) {
					Validation = false;
				}
				if (! WinUser.user_category.validate()) {
					Validation = false;
				}
				if (! WinUser.movie_title.validate()) {
					Validation = false;
				}
				if (! WinUser.user_volume.validate()) {
					Validation = false;
				}
				if (! WinUser.user_weight.validate()) {
					Validation = false;
				}
				if (! WinUser.user_dest.validate()) {
					Validation = false;
				}
				if (! WinUser.route.validate()) {
					Validation = false;
				}
				if (! WinUser.route_cost.validate()) {
					Validation = false;
				}
				if (! Validation) {
					return;
				}
				
				Ext.Ajax.request({
					params: Param,
					url: Web.HOST + '/index.php/similarity/user/action',
					success: function(TempResult) {
						eval('var Result = ' + TempResult.responseText);
						Renderer.FlashMessage(Result.Message);
                        
                        if (Result.QueryStatus == '1') {
							UserStore.load();
							WinUser.hide();
                        }
					}
				});
			}
		});
		WinUser.show();
	}
	
	Renderer.InitWindowSize({ Panel: -1, Grid: UserGrid, Toolbar: 70 });
    Ext.EventManager.onWindowResize(function() {
		Renderer.InitWindowSize({ Panel: -1, Grid: UserGrid, Toolbar: 70 });
    }, UserGrid);
});