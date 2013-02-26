var DATE_FORMAT = 'd-m-Y';
var TIME_FORMAT = 'H:i';
var CLICK_TO_EDIT = 1;

Number.prototype.formatMoney = function(c, d, t){
var n = this, c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "," : d, t = t == undefined ? "." : t, s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;
   return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

var Renderer = {
	InitWindowSize: function(Param) {
		Renderer.AutoWindowSize({ Panel: Param.Panel, Grid: Param.Grid, Toolbar: Param.Toolbar });
		
		// garai hang ra usah on resize
		return;
		window.onresize = function() {
			Renderer.AutoWindowSize({ Panel: Param.Panel, Grid: Param.Grid, Toolbar: Param.Toolbar });
		};
	},
	AutoWindowSize: function(Param) {
		if (typeof window.innerWidth != 'undefined') {
			WindowWidth = window.innerWidth;
			WindowHeight = window.innerHeight;
		} else if (typeof document.documentElement != 'undefined' && typeof document.documentElement.clientWidth != 'undefined' && document.documentElement.clientWidth != 0) {
			WindowWidth = document.documentElement.clientWidth,
			WindowHeight = document.documentElement.clientHeight
		} else {
			WindowWidth = document.getElementsByTagName('body')[0].clientWidth;
			WindowHeight = document.getElementsByTagName('body')[0].clientHeight;
		}
		
		if (Param.Panel == -1) {
			Param.Grid.setHeight(WindowHeight);
		} else {
			Param.Panel.setHeight(WindowHeight);
			Param.Grid.setHeight(WindowHeight - Param.Toolbar);
		}
	},
	Money: function(value) {
		value = parseInt(value, 10);
        return value.formatMoney();
    },
	YesNo: function(value) {
		return (value == 1) ? 'Yes' : 'No';
    },
	FlashMessage: function(Message) {
		Ext.Msg.alert('Informasi', Message);
	}
}

var Func = {
	GetDateFromString: {
		Date: function(Value) {
			if (Value.length < 10) {
				return '';
			}
			
			var RawValue = Value.substr(0, 10);
			if (RawValue == '0000-00-00') {
				return '';
			}
			
			return RawValue;
		},
		Time: function(Value) {
			if (Value.length < 19) {
				return '';
			}
			
			var RawValue = Value.substr(11, 5);
			if (RawValue == '00:00') {
				return '';
			}
			
			return RawValue;
		}
	},
	ShowFormat: {
		Date: function(Value) {
			if (Value == null) {
				return '';
			} else if (typeof(Value) == 'string') {
				return Value;
			}
			
			var Day = Value.getDate();
			var DayText = (Day.toString().length == 1) ? '0' + Day : Day;
			var Month = Value.getMonth() + 1;
			var MonthText = (Month.toString().length == 1) ? '0' + Month : Month;
			var Date = Value.getFullYear() + '-' + MonthText + '-' + DayText;
			return Date;
		},
		Time: function(Value) {
			if (Value == null) {
				return '00:00';
			} else if (typeof(Value) == 'string' && Value == '') {
				return '00:00';
			}
			
			var Hour = Value.getHours();
			var HourText = (Hour.toString().length == 1) ? '0' + Hour : Hour;
			var Minute = Value.getMinutes();
			var MinuteText = (Minute.toString().length == 1) ? '0' + Minute : Minute;
			var Time = HourText + ':' + MinuteText;
			return Time;
		}
	},
	ArrayToJson: function(Data) {
		var Temp = '';
		for (var i = 0; i < Data.length; i++) {
			Temp = (Temp.length == 0) ? Func.ObjectToJson(Data[i]) : Temp + ',' + Func.ObjectToJson(Data[i]);
		}
		return '[' + Temp + ']';
	},
	InArray: function(Value, Array) {
		var Result = false;
		for (var i = 0; i < Array.length; i++) {
			if (Value == Array[i]) {
				Result = true;
				break
			}
		}
		return Result;
	},
	IsEmpty: function(value) {
		var Result = false;
		if (value == null || value == 0) {
			Result = true;
		} else if (typeof(value) == 'string') {
			value = Helper.Trim(value);
			if (value.length == 0) {
				Result = true;
			}
		}
		
		return Result;
	},
	ObjectToJson: function(obj) {
		var str = '';
		for (var p in obj) {
			if (obj.hasOwnProperty(p)) {
				if (obj[p] != null) {
					str += (str.length == 0) ? str : ',';
					str += '"' + p + '":"' + obj[p] + '"';
				}
			}
		}
		str = '{' + str + '}';
		return str;
	},
	SetValue: function(Param) {
		if (Param.ForceID == 0) {
			return;
		}
		
		Ext.Ajax.request({
			url: Web.HOST + '/index.php/combo',
			params: { Action : Param.Action, ForceID: Param.ForceID },
			success: function(Result) {
				Param.Combo.store.loadData(eval(Result.responseText));
				Param.Combo.setValue(Param.ForceID);
			}
		});
	},
	SyncComboParam: function(c, Param) {
		var ArrayConfig = ['renderTo', 'name', 'fieldLabel', 'anchor', 'id', 'allowBlank', 'blankText', 'tooltip', 'iconCls', 'width', 'listeners', 'value', 'valueField', 'margin'];
		for (var i = 0; i < ArrayConfig.length; i++) {
			if (Param[ArrayConfig[i]] != null) {
				c[ArrayConfig[i]] = Param[ArrayConfig[i]];
			}
		}
		return c;
	},
	Trim: function(value) {
		return value.replace(/^\s+|\s+$/g,'');
	}
}

var Template = {
	Item: new Ext.XTemplate(
		'<ul>' +
		'<li style="padding: 2px; font-weight: bold;">' +
			'<div style="float: left; width: 275px;">Judul</div>' +
			'<div style="float: left; width: 150px;">Tanggal</div>' +
			'<div class="clear"></div>' +
		'</li>' +
		'<tpl for="."><li class="x-boundlist-item">' +
			'<div style="float: left; width: 275px;">{movie_title}</div>' +
			'<div style="float: left; width: 125px;">{release_date}</div>' +
			'<div class="clear"></div>' +
		'</li></tpl></ul>'
	)
}

var Store = {
	Item: function() {
		var Store = new Ext.create('Ext.data.Store', {
			fields: ['item_id', 'movie_title', 'release_date'],
			autoLoad: false, proxy: {
				type: 'ajax', extraParams: { Action: 'Item' },
				url: Web.HOST + '/index.php/combo',
				reader: { type: 'json', root: 'res' },
				actionMethods: { read: 'POST' }
			}
		});
		
		return Store;
	}
}

var Combo = {
	Param: {
		Item: function(Param) {
			var p = {
				xtype: 'combo', store: Store.Item(), minChars: 1, selectOnFocus: false,
				triggerAction: 'all', lazyRender: true, typeAhead: true,
				valueField: 'item_id', displayField: 'movie_title',
				listConfig: { minWidth: 480 }, tpl: Template.Item,
				readonly: false, editable: true
			}
			p = Func.SyncComboParam(p, Param);
			return p;
		}
	}
}

Combo.Class = {
	Item: function(Param) {
		var c = new Ext.form.ComboBox(Combo.Param.Item(Param));
		return c;
	}
}

function ShowReport(Param) {
    if (Param.ReportName == null) {
        alert('Please enter Report Name');
        return;
    }
    
    var GenerateLink = function(Toolbar, ReportName) {
		var Validation = true;
        var ReportLink = Web.HOST + '/index.php/report/index/' + ReportName + '/?';
        for (var j = 0; j < Toolbar.length; j++) {
            if (Toolbar[j].name != null) {
                var name = Toolbar[j].name;
                var value = Toolbar[j].getValue();
                if (Toolbar[j].xtype == 'datefield') {
                    value = Func.ShowFormat.Date(Toolbar[j].getValue());
                }
				
				// Validation Form
				if (! Toolbar[j].validate()) {
					Validation = false;
				}
                
                // Validation Data
                value = (value == null) ? '' : value;
                
                // Generate Link
                ReportLink += '&' + name + '=' + value;
            }
        }
        return Validation ? ReportLink : '';
    }
    
	Param.title = (Param.title == null) ? 'Report' : Param.title;
	Param.close = (Param.close == null) ? true : Param.close;
	Param.maximizable = (Param.maximizable == null) ? true : Param.maximizable;
	
	Param.listeners = (Param.listeners == null) ? { } : Param.listeners;
	Param.listeners.hide = function(w) { w.destroy(); w = WinReport = null; }
    if (Param.listeners.show == null && Param.ArrayToolbar == null) {
        Param.listeners.show = function(w) {
            var iframe = '<iframe src="' + URLS.php + '/report/index/' + Param.ReportName + '/" style="width: 100%; height: 100%;"></iframe>';
            w.body.dom.innerHTML = iframe;
        }
    }
	
	Param.buttons = (Param.buttons == null) ? [] : Param.buttons;
	if (Param.close) {
		Param.buttons.push({ text: 'Close', handler: function(w) { WinReport.hide(); } });
	}
	
	var ArrayToolbar = {
		'agent': {
			FieldName: 'Agent', 
			Config: Combo.Param.Agent({ name: 'agent_id', width: 100, margin: '0 10px 0 0;' })
		},
		'date_end': {
			FieldName: 'Date End', 
			Config: {
				xtype: 'datefield', format: DATE_FORMAT, width: 100, name: 'date_end', margin: '0 10px 0 0;',
				allowBlank: false, blankText: 'Date End cannot be empty'
			}
		},
		'date_select': {
			FieldName: 'Date', 
			Config: {
				xtype: 'datefield', format: DATE_FORMAT, width: 100, name: 'date_select'
			}
		},
		'date_start': {
			FieldName: 'Date Start', 
			Config: {
				xtype: 'datefield', format: DATE_FORMAT, width: 100, name: 'date_start', margin: '0 10px 0 0;',
				allowBlank: false, blankText: 'Date Start cannot be empty'
			}
		},
		'gateway': {
			FieldName: 'Gateway', 
			Config: Combo.Param.Gateway({ name: 'gateway_id', width: 100, margin: '0 10px 0 0;' })
		},
		'gateway_in_out': {
			FieldName: 'Gateway Type', 
			Config: Combo.Param.GatewayInOut({ name: 'gateway_in_out', width: 100, margin: '0 10px 0 0;' })
		}
	}
	
	var Tbar = [];
	Param.ArrayToolbar = (Param.ArrayToolbar == null) ? [] : Param.ArrayToolbar;
	for (var i = 0; i < Param.ArrayToolbar.length; i++) {
		var InputName = Param.ArrayToolbar[i];
		if (ArrayToolbar[InputName] != null) {
			Tbar.push({ xtype: 'label', text: ArrayToolbar[InputName].FieldName + ' : ' });
			Tbar.push(ArrayToolbar[InputName].Config);
		}
	}
	if (Tbar.length > 0) {
		Tbar.push({
			text: 'Generate', iconCls: 'reportIcon', handler: function() {
				for (var i = 0; i < Param.win.dockedItems.items.length; i++) {
					if (Param.win.dockedItems.items[i].dock == 'top' && Param.win.dockedItems.items[i].xtype == 'toolbar') {
                        var ReportLink = GenerateLink(Param.win.dockedItems.items[i].items.items, Param.ReportName);
						if (ReportLink == '') {
							return;
						}
						
						Param.win.body.dom.innerHTML = '<iframe src="' + ReportLink + '" style="width: 100%; height: 100%;"></iframe>';
						break;
					}
				}
			}
		});
	}
	
	var WinReport = new Ext.Window({
		layout: 'fit', width: 400, height: 350, closeAction: 'hide', plain: true,
		maximized: true, maximizable: Param.maximizable, title: Param.title, tbar: Tbar,
		closable: Param.close, resizable: false,
		buttons: Param.buttons, listeners: Param.listeners
	});
	WinReport.show();
	
	Param.win = WinReport;
}