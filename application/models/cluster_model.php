<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Cluster_model extends CI_Model {
	function __construct() {
        parent::__construct();
		
		$this->Field = array('item_id', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10');
    }
	
	function Update($Param) {
		$Result = array();
		
		if (empty($Param['item_id'])) {
			$InsertQuery  = GenerateInsertQuery($this->Field, $Param, CLUSTER);
			$InsertResult = mysql_query($InsertQuery) or die(mysql_error());
			
			$Result['item_id'] = mysql_insert_id();
			$Result['QueryStatus'] = '1';
			$Result['Message'] = 'Data successfully stored.';
		} else {
			$UpdateQuery  = GenerateUpdateQuery($this->Field, $Param, CLUSTER);
			$UpdateResult = mysql_query($UpdateQuery) or die(mysql_error());
			
			$Result['item_id'] = $Param['item_id'];
			$Result['QueryStatus'] = '1';
			$Result['Message'] = 'Data successfully updated.';
		}
		
		return $Result;
	}
	
	function GetByID($Param) {
		$Array = array();
		
		if (isset($Param['item_id'])) {
			$SelectQuery  = "
				SELECT Cluster.*
				FROM ".CLUSTER." Cluster
				WHERE item_id = '".$Param['item_id']."'
				LIMIT 1";
		}
		
		$SelectResult = mysql_query($SelectQuery) or die(mysql_error());
		if (false !== $Row = mysql_fetch_assoc($SelectResult)) {
			$Array = StripArray($Row);
		}
		
		return $Array;
	}
	
	function GetArray($Param = array()) {
		$Array = array();
		$StringFilter = GetStringFilter($Param);
		
		$PageOffset = (isset($Param['start']) && !empty($Param['start'])) ? $Param['start'] : 0;
		$PageLimit = (isset($Param['limit']) && !empty($Param['limit'])) ? $Param['limit'] : 25;
        $StringSorting = (isset($Param['sort'])) ? GetStringSorting($Param['sort']) : 'item_id ASC';
		
		$SelectQuery = "
			SELECT Cluster.*
			FROM ".CLUSTER." Cluster
			WHERE 1 $StringFilter
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
		$StringFilter = GetStringFilter($Param);
		
		$SelectQuery = "
			SELECT COUNT(*) AS TotalRecord
			FROM ".CLUSTER." Cluster
			WHERE 1 $StringFilter
		";
		$SelectResult = mysql_query($SelectQuery) or die(mysql_error());
		while (false !== $Row = mysql_fetch_assoc($SelectResult)) {
			$TotalRecord = $Row['TotalRecord'];
		}
		
		return $TotalRecord;
	}
	
	function GetArrayUser($item_id, $field_name = 'c1') {
		$ArrayItem = $this->GetArray(array( 'start' => 0, 'limit' => 10000 ));
		
		$ArrayResult = array();
		foreach ($ArrayItem as $Array) {
			$ArrayResult[$Array['item_id']] = $Array[$field_name];
		}
		
		return $ArrayResult;
	}
	
	function Delete($Param) {
		if (isset($Param['item_id'])) {
			$DeleteQuery  = "DELETE FROM ".CLUSTER." WHERE item_id = '".$Param['item_id']."' LIMIT 1";
			$DeleteResult = mysql_query($DeleteQuery) or die(mysql_error());
		}
        
        $Result['QueryStatus'] = '1';
        $Result['Message'] = 'Data has been deleted.';
		
		return $Result;
	}
}