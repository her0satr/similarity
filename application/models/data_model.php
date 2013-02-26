<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Data_model extends CI_Model {
	function __construct() {
        parent::__construct();
		
		$this->Field = array('user_id', 'item_id', 'rating', 'timestamp');
    }
	
	function Update($Param) {
		$Result = array();
		
		if (empty($Param['item_id'])) {
			$InsertQuery  = GenerateInsertQuery($this->Field, $Param, DATA);
			$InsertResult = mysql_query($InsertQuery) or die(mysql_error());
			
			$Result['item_id'] = mysql_insert_id();
			$Result['QueryStatus'] = '1';
			$Result['Message'] = 'Data berhasil tersimpan.';
		} else {
			$UpdateQuery  = GenerateUpdateQuery($this->Field, $Param, DATA);
			$UpdateResult = mysql_query($UpdateQuery) or die(mysql_error());
			
			$Result['item_id'] = $Param['item_id'];
			$Result['QueryStatus'] = '1';
			$Result['Message'] = 'Data berhasil diperbaharui.';
		}
		
		return $Result;
	}
	
	function GetByID($Param) {
		$Array = array();
		
		if (isset($Param['item_id'])) {
			$SelectQuery  = "
				SELECT Data.*
				FROM ".DATA." Data
				WHERE Data.item_id = '".$Param['item_id']."' LIMIT 1";
		}
		
		$SelectResult = mysql_query($SelectQuery) or die(mysql_error());
		if (false !== $Row = mysql_fetch_assoc($SelectResult)) {
			$Array = StripArray($Row);
		}
		
		return $Array;
	}
	
	function GetArray($Param = array()) {
		$Array = array();
		
		$StringSearch = (isset($Param['NameLike'])) ? "AND item_name LIKE '%" . $Param['NameLike'] . "%'"  : '';
		$StringFilter = GetStringFilter($Param);
		
		$PageOffset = (isset($Param['start']) && !empty($Param['start'])) ? $Param['start'] : 0;
		$PageLimit = (isset($Param['limit']) && !empty($Param['limit'])) ? $Param['limit'] : 25;
		$StringSorting = (isset($Param['sort'])) ? GetStringSorting($Param['sort']) : 'item_name ASC';
		
		$SelectQuery = "
			SELECT Data.*
			FROM ".DATA." Data
			WHERE 1 $StringSearch $StringFilter
			ORDER BY $StringSorting
			LIMIT $PageOffset, $PageLimit
		";
		$SelectResult = mysql_query($SelectQuery) or die(mysql_error());
		while (false !== $Row = mysql_fetch_assoc($SelectResult)) {
			$Row = StripArray($Row);
			$Array[] = $Row;
		}
		
		return $Array;
	}
	
	function GetCount($Param = array()) {
		$TotalRecord = 0;
		
		$StringSearch = (isset($Param['NameLike'])) ? "AND item_name LIKE '%" . $Param['NameLike'] . "%'"  : '';
		$StringFilter = GetStringFilter($Param);
		
		$SelectQuery = "
			SELECT COUNT(*) AS TotalRecord
			FROM ".DATA." Data
			LEFT JOIN ".PROVINCE." Province ON Province.province_id = Data.province_id
			LEFT JOIN ".COUNTRY." Country ON Country.country_id = Province.country_id
			WHERE 1 $StringSearch $StringFilter
		";
		$SelectResult = mysql_query($SelectQuery) or die(mysql_error());
		while (false !== $Row = mysql_fetch_assoc($SelectResult)) {
			$TotalRecord = $Row['TotalRecord'];
		}
		
		return $TotalRecord;
	}
	
	function GetArrayUser($item_id) {
		$ArrayParam = array(
			'sort' => '[{"property":"user_id","direction":"ASC"}]', 'start' => 0, 'limit' => 10000,
			'filter' => '[{"type":"numeric","comparison":"eq","value":' . $item_id . ',"field":"item_id"}]'
		);
		$ArrayItem = $this->GetArray($ArrayParam);
		
		$ArrayResult = array();
		foreach ($ArrayItem as $Array) {
			$ArrayResult[$Array['user_id']] = $Array['rating'];
		}
		
		return $ArrayResult;
	}
	
	function Delete($Param) {
		$DeleteQuery  = "DELETE FROM ".DATA." WHERE item_id = '".$Param['item_id']."' LIMIT 1";
		$DeleteResult = mysql_query($DeleteQuery) or die(mysql_error());
		
		$Result['QueryStatus'] = '1';
		$Result['Message'] = 'Data berhasil dihapus.';
		
		return $Result;
	}
}