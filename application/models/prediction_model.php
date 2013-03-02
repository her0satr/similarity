<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Prediction_model extends CI_Model {
	function __construct() {
        parent::__construct();
		
		$this->Field = array('prediction_id', 'item_id', 'user_id', 'prediction_value');
    }
	
	function Update($Param) {
		$Prediction = array();
		
		if (empty($Param['prediction_id'])) {
			$InsertQuery  = GenerateInsertQuery($this->Field, $Param, PREDICTION);
			$InsertPrediction = mysql_query($InsertQuery) or die(mysql_error());
			
			$Prediction['prediction_id'] = mysql_insert_id();
			$Prediction['QueryStatus'] = '1';
			$Prediction['Message'] = 'Data berhasil tersimpan.';
		} else {
			$UpdateQuery  = GenerateUpdateQuery($this->Field, $Param, PREDICTION);
			$UpdatePrediction = mysql_query($UpdateQuery) or die(mysql_error());
			
			$Prediction['prediction_id'] = $Param['prediction_id'];
			$Prediction['QueryStatus'] = '1';
			$Prediction['Message'] = 'Data berhasil diperbaharui.';
		}
		
		return $Prediction;
	}
	
	function GetByID($Param) {
		$Array = array();
		
		if (isset($Param['prediction_id'])) {
			$SelectQuery  = "
				SELECT Prediction.*
				FROM ".PREDICTION." Prediction
				WHERE Prediction.prediction_id = '".$Param['prediction_id']."' LIMIT 1";
		}
		
		$SelectPrediction = mysql_query($SelectQuery) or die(mysql_error());
		if (false !== $Row = mysql_fetch_assoc($SelectPrediction)) {
			$Array = $this->Sync($Row);
		}
		
		return $Array;
	}
	
	function GetArray($Param = array()) {
		$Array = array();
		
		$StringItem = (isset($Param['item_id'])) ? "AND Item.item_id = '" . $Param['item_id'] . "'"  : '';
		$StringUser = (isset($Param['user_id'])) ? "AND User.user_id = '" . $Param['user_id'] . "'"  : '';
		$StringFilter = GetStringFilter($Param);
		
		$PageOffset = (isset($Param['start']) && !empty($Param['start'])) ? $Param['start'] : 0;
		$PageLimit = (isset($Param['limit']) && !empty($Param['limit'])) ? $Param['limit'] : 25;
		$StringSorting = (isset($Param['sort'])) ? GetStringSorting($Param['sort']) : 'Item.movie_title ASC';
		
		$SelectQuery = "
			SELECT Prediction.*, Item.movie_title, User.occupation
			FROM ".PREDICTION." Prediction
			LEFT JOIN ".ITEM." Item ON Item.item_id = Prediction.item_id
			LEFT JOIN ".USER." User ON User.user_id = Prediction.user_id
			WHERE 1 $StringItem $StringUser $StringFilter
			ORDER BY $StringSorting
			LIMIT $PageOffset, $PageLimit
		";
		$SelectPrediction = mysql_query($SelectQuery) or die(mysql_error());
		while (false !== $Row = mysql_fetch_assoc($SelectPrediction)) {
			$Row = $this->Sync($Row);
			$Array[] = $Row;
		}
		
		return $Array;
	}
	
	function GetCount($Param = array()) {
		$TotalRecord = 0;
		
		$StringItem = (isset($Param['item_id'])) ? "AND Item.item_id = '" . $Param['item_id'] . "'"  : '';
		$StringUser = (isset($Param['user_id'])) ? "AND User.user_id = '" . $Param['user_id'] . "'"  : '';
		$StringFilter = GetStringFilter($Param);
		
		$SelectQuery = "
			SELECT COUNT(*) AS TotalRecord
			FROM ".PREDICTION." Prediction
			LEFT JOIN ".ITEM." Item ON Item.item_id = Prediction.item_id
			LEFT JOIN ".USER." User ON User.user_id = Prediction.user_id
			WHERE 1 $StringItem $StringUser $StringFilter
		";
		$SelectPrediction = mysql_query($SelectQuery) or die(mysql_error());
		while (false !== $Row = mysql_fetch_assoc($SelectPrediction)) {
			$TotalRecord = $Row['TotalRecord'];
		}
		
		return $TotalRecord;
	}
	
	function Delete($Param) {
		$DeleteQuery  = "DELETE FROM ".PREDICTION." WHERE prediction_id = '".$Param['prediction_id']."' LIMIT 1";
		$DeletePrediction = mysql_query($DeleteQuery) or die(mysql_error());
		
		$Prediction['QueryStatus'] = '1';
		$Prediction['Message'] = 'Prediction berhasil dihapus.';
		
		return $Prediction;
	}
	
	function Sync($Row) {
		$Row = StripArray($Row);
		$Row['prediction_value'] = NumberFormat($Row['prediction_value']);
		
		return $Row;
	}
}