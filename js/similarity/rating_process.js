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
	
	var IsGenerate = 0;
	function GenerateRating(user_id, store) {
		Ext.Ajax.request({
			url: Web.HOST + '/index.php/similarity/rating_process/trigger',
			params: { user_id: user_id },
			success: function(TempResult) {
				eval('var Result = ' + TempResult.responseText);
				store.load();
				
				if (IsGenerate == 1 && Result.Loop == 1) {
					setTimeout(function() {
						GenerateRating(user_id, store);
					}, 1000);
				} else if (IsGenerate == 1 && Result.next_user_id > 0) {
					Func.SetValue({ Action: 'User', Combo: Ext.getCmp('userTB'), ForceID: Result.next_user_id });
					ResultStore.proxy.extraParams.user_id = Result.next_user_id;
					ResultStore.load();
					
					setTimeout(function() {
						GenerateRating(Result.next_user_id, ResultStore);
					}, 1000);
				} else {
					Renderer.FlashMessage(Result.Message);
				}
			}
		});
	}
	
	var ResultStore = Ext.create('Ext.data.Store', {
		autoLoad: false, pageSize: 25, remoteSort: true,
        sorters: [{ property: 'movie_title', direction: 'ASC' }],
		fields: [ 'prediction_id', 'item_id', 'user_id', 'prediction_value', 'movie_title' ],
		proxy: {
			type: 'ajax', extraParams: { },
			url : Web.HOST + '/index.php/similarity/rating_process/grid', actionMethods: { read: 'POST' },
			reader: { type: 'json', root: 'rows', totalProperty: 'totalCount' }
		}
	});
    
	var ResultGrid = Ext.create('Ext.grid.Panel', {
		viewResult: { forceFit: true }, store: ResultStore, height: 400, renderTo: Ext.get('grid-member'),
		features: [{ ftype: 'filters', encode: true, local: false }], layout: 'fit',
		columns: [ {
				header: 'Judul', dataIndex: 'movie_title', sortable: true, filter: true, width: 350
		}, {	header: 'Prediksi Nilai', dataIndex: 'prediction_value', sortable: true, filter: true, width: 100, align: 'right'
		} ],
		tbar: [ {
				xtype: 'label', text: 'User :'
			}, 	Combo.Param.User({ width: 300, id: 'userTB', listeners: {
					select: function() {
						ResultGrid.LoadGrid();
					}
				}
			}), {
				text: 'Generate', iconCls: 'addIcon', tooltip: 'Generate Item', handler: function() {
					IsGenerate = 1;
					GenerateRating(Ext.getCmp('userTB').getValue(), ResultStore);
				}
			}, '-', {
				text: 'Stop', iconCls: 'delIcon', tooltip: 'Stop Generate', handler: function() {
					IsGenerate = 0;
				}
			}
		],
		bbar: new Ext.PagingToolbar( {
			store: ResultStore, displayInfo: true,
			displayMsg: 'Displaying topics {0} - {1} of {2}',
			emptyMsg: 'No topics to display'
		} ),
		listeners: {
			'itemdblclick': function(model, records) {
//				ResultGrid.Update({ });
            }
        },
		LoadGrid: function(Param) {
			ResultStore.proxy.extraParams.user_id = Ext.getCmp('userTB').getValue();
			ResultStore.load();
		},
		Delete: function(Value) {
			if (Value == 'no') {
				return;
			}
			
			Ext.Ajax.request({
				url: Web.HOST + '/index.php/similarity/result/action',
				params: { Action: 'DeteleResultByID', result_id: ResultGrid.getSelectionModel().getSelection()[0].data.result_id },
				success: function(TempResult) {
					eval('var Result = ' + TempResult.responseText)
					
					Renderer.FlashMessage(Result.Message);
					if (Result.QueryStatus == '1') {
						ResultStore.load();
					}
				}
			});
		}
	});
	
	Renderer.InitWindowSize({ Panel: -1, Grid: ResultGrid, Toolbar: 70 });
    Ext.EventManager.onWindowResize(function() {
		Renderer.InitWindowSize({ Panel: -1, Grid: ResultGrid, Toolbar: 70 });
    }, ResultGrid);
});