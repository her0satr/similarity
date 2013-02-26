<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Result_model extends CI_Model {
	function __construct() {
        parent::__construct();
		
		$this->Field = array('result_id', 'item_primary', 'item_secondary', 'similarity_item', 'similarity_group', 'similarity');
    }
	
	function Update($Param) {
		$Result = array();
		
		if (empty($Param['result_id'])) {
			$InsertQuery  = GenerateInsertQuery($this->Field, $Param, RESULT);
			$InsertResult = mysql_query($InsertQuery) or die(mysql_error());
			
			$Result['result_id'] = mysql_insert_id();
			$Result['QueryStatus'] = '1';
			$Result['Message'] = 'Data berhasil tersimpan.';
		} else {
			$UpdateQuery  = GenerateUpdateQuery($this->Field, $Param, RESULT);
			$UpdateResult = mysql_query($UpdateQuery) or die(mysql_error());
			
			$Result['result_id'] = $Param['result_id'];
			$Result['QueryStatus'] = '1';
			$Result['Message'] = 'Data berhasil diperbaharui.';
		}
		
		return $Result;
	}
	
	function GetByID($Param) {
		$Array = array();
		
		if (isset($Param['result_id'])) {
			$SelectQuery  = "
				SELECT Result.*
				FROM ".RESULT." Result
				WHERE Result.result_id = '".$Param['result_id']."' LIMIT 1";
		} else if (isset($Param['item_primary']) && isset($Param['item_secondary'])) {
			$SelectQuery  = "
				SELECT Result.*
				FROM ".RESULT." Result
				WHERE Result.item_primary = '".$Param['item_primary']."' AND Result.item_secondary = '".$Param['item_secondary']."'
				LIMIT 1";
		}
		
		$SelectResult = mysql_query($SelectQuery) or die(mysql_error());
		if (false !== $Row = mysql_fetch_assoc($SelectResult)) {
			$Array = $this->Sync($Row);
		}
		
		return $Array;
	}
	
	function GetArray($Param = array()) {
		$Array = array();
		
		$StringPrimary = (isset($Param['item_primary'])) ? "AND ItemPrimary.item_id = '" . $Param['item_primary'] . "'"  : '';
		$StringSearch = (isset($Param['NameLike'])) ? "AND ItemSecondary.movie_title LIKE '%" . $Param['NameLike'] . "%'"  : '';
		$StringFilter = GetStringFilter($Param);
		
		$PageOffset = (isset($Param['start']) && !empty($Param['start'])) ? $Param['start'] : 0;
		$PageLimit = (isset($Param['limit']) && !empty($Param['limit'])) ? $Param['limit'] : 25;
		$StringSorting = (isset($Param['sort'])) ? GetStringSorting($Param['sort'], array('secondary_title' => 'ItemSecondary.movie_title')) : 'ItemSecondary.movie_title ASC';
		
		$SelectQuery = "
			SELECT Result.*, ItemPrimary.movie_title primary_title, ItemSecondary.movie_title secondary_title
			FROM ".RESULT." Result
			LEFT JOIN ".ITEM." ItemPrimary ON ItemPrimary.item_id = Result.item_primary
			LEFT JOIN ".ITEM." ItemSecondary ON ItemSecondary.item_id = Result.item_secondary
			WHERE 1 $StringSearch $StringPrimary $StringFilter
			ORDER BY $StringSorting
			LIMIT $PageOffset, $PageLimit
		";
		$SelectResult = mysql_query($SelectQuery) or die(mysql_error());
		while (false !== $Row = mysql_fetch_assoc($SelectResult)) {
			$Row = $this->Sync($Row);
			$Array[] = $Row;
		}
		
		return $Array;
	}
	
	function GetCount($Param = array()) {
		$TotalRecord = 0;
		
		$StringPrimary = (isset($Param['item_primary'])) ? "AND ItemPrimary.item_id = '" . $Param['item_primary'] . "'"  : '';
		$StringSearch = (isset($Param['NameLike'])) ? "AND ItemSecondary.movie_title LIKE '%" . $Param['NameLike'] . "%'"  : '';
		$StringFilter = GetStringFilter($Param);
		
		$SelectQuery = "
			SELECT COUNT(*) AS TotalRecord
			FROM ".RESULT." Result
			LEFT JOIN ".ITEM." ItemPrimary ON ItemPrimary.item_id = Result.item_primary
			LEFT JOIN ".ITEM." ItemSecondary ON ItemSecondary.item_id = Result.item_secondary
			WHERE 1 $StringSearch $StringPrimary $StringFilter
		";
		$SelectResult = mysql_query($SelectQuery) or die(mysql_error());
		while (false !== $Row = mysql_fetch_assoc($SelectResult)) {
			$TotalRecord = $Row['TotalRecord'];
		}
		
		return $TotalRecord;
	}
	
	function GetNextSecondary($item_primary) {
		$MaxNo = 0;
		$SelectQuery  = "
			SELECT MAX(item_secondary) MaxNo FROM ".RESULT." Result
			WHERE item_primary = '".$item_primary."' LIMIT 1";
		$SelectResult = mysql_query($SelectQuery) or die(mysql_error());
		if (false !== $Row = mysql_fetch_assoc($SelectResult)) {
			$MaxNo = $Row['MaxNo'];
		}
		
		$MaxNo = $MaxNo + 1;
		
		$ItemCheck = $this->Item_model->GetByID(array( 'item_id' => $MaxNo ));
		if (count($ItemCheck) == 0) {
			$MaxNo = 0;
		}
		
		return $MaxNo;
	}
	
	function Delete($Param) {
		$DeleteQuery  = "DELETE FROM ".RESULT." WHERE result_id = '".$Param['result_id']."' LIMIT 1";
		$DeleteResult = mysql_query($DeleteQuery) or die(mysql_error());
		
		$Result['QueryStatus'] = '1';
		$Result['Message'] = 'Result berhasil dihapus.';
		
		return $Result;
	}
	
	function Sync($Row) {
		$Row = StripArray($Row);
		$Row['similarity_item'] = NumberFormat($Row['similarity_item']);
		$Row['similarity_group'] = NumberFormat($Row['similarity_group']);
		$Row['similarity'] = NumberFormat($Row['similarity']);
		
		return $Row;
	}
}