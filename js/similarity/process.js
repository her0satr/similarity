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
	function GenerateSimilarity(item_primary, store) {
		Ext.Ajax.request({
			url: Web.HOST + '/index.php/similarity/process/trigger',
			params: { item_primary: item_primary },
			success: function(TempResult) {
				eval('var Result = ' + TempResult.responseText);
				store.load();
				
				if (IsGenerate == 1 && Result.Loop == 1) {
					setTimeout(function() {
						GenerateSimilarity(item_primary, store);
					}, 1000);
				} else if (IsGenerate == 1 && Result.next_item_id > 0) {
					Func.SetValue({ Action: 'Item', Combo: Ext.getCmp('itemTB'), ForceID: Result.next_item_id });
					ResultStore.proxy.extraParams.item_primary = Result.next_item_id;
					ResultStore.load();
					
					setTimeout(function() {
						GenerateSimilarity(Result.next_item_id, ResultStore);
					}, 1000);
				} else {
					Renderer.FlashMessage(Result.Message);
				}
			}
		});
	}
	
	var ResultStore = Ext.create('Ext.data.Store', {
		autoLoad: false, pageSize: 25, remoteSort: true,
        sorters: [{ property: 'secondary_title', direction: 'ASC' }],
		fields: [ 'result_id', 'primary_title', 'secondary_title', 'similarity_item', 'similarity_group', 'similarity' ],
		proxy: {
			type: 'ajax', extraParams: { },
			url : Web.HOST + '/index.php/similarity/process/grid', actionMethods: { read: 'POST' },
			reader: { type: 'json', root: 'rows', totalProperty: 'totalCount' }
		}
	});
    
	var ResultGrid = Ext.create('Ext.grid.Panel', {
		viewResult: { forceFit: true }, store: ResultStore, height: 400, renderTo: Ext.get('grid-member'),
		features: [{ ftype: 'filters', encode: true, local: false }], layout: 'fit',
		columns: [ {
				header: 'Judul', dataIndex: 'secondary_title', sortable: true, filter: true, width: 350
		}, {	header: 'Similarity Item', dataIndex: 'similarity_item', sortable: true, filter: true, width: 100, align: 'right'
		}, {	header: 'Similarity Group', dataIndex: 'similarity_group', sortable: true, filter: true, width: 100, align: 'right'
		}, {	header: 'Similarity', dataIndex: 'similarity', sortable: true, filter: true, width: 100, align: 'right'
		} ],
		tbar: [ {
				xtype: 'label', text: 'Item :'
			}, 	Combo.Param.Item({ width: 300, id: 'itemTB', listeners: {
					select: function() {
						ResultGrid.LoadGrid();
					}
				}
			}), {
				text: 'Generate', iconCls: 'addIcon', tooltip: 'Generate Item', handler: function() {
					IsGenerate = 1;
					GenerateSimilarity(Ext.getCmp('itemTB').getValue(), ResultStore);
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
			ResultStore.proxy.extraParams.item_primary = Ext.getCmp('itemTB').getValue();
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