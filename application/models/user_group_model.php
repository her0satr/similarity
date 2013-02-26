<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class User_Group_model extends CI_Model {
	function __construct() {
        parent::__construct();
		
		$this->Field = array('user_group_id', 'user_id', 'group_id', 'agent_id', 'gateway_id');
    }
	
	function Update($Param) {
		$Result = array();
		
		if (empty($Param['user_group_id'])) {
			$InsertQuery  = GenerateInsertQuery($this->Field, $Param, USER_GROUP);
			$InsertResult = mysql_query($InsertQuery) or die(mysql_error());
			
			$Result['user_group_id'] = mysql_insert_id();
			$Result['QueryStatus'] = '1';
			$Result['Message'] = 'Data berhasil tersimpan.';
		} else {
			$UpdateQuery  = GenerateUpdateQuery($this->Field, $Param, USER_GROUP);
			$UpdateResult = mysql_query($UpdateQuery) or die(mysql_error());
			
			$Result['user_group_id'] = $Param['user_group_id'];
			$Result['QueryStatus'] = '1';
			$Result['Message'] = 'Data berhasil diperbaharui.';
		}
		
		return $Result;
	}
	
	function GetByID($Param) {
		$Array = array();
		
		if (isset($Param['user_group_id'])) {
			$SelectQuery  = "
				SELECT UserGroup.*
				FROM ".USER_GROUP." UserGroup
				WHERE UserGroup.user_group_id = '".$Param['user_group_id']."' LIMIT 1";
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
		$StringSorting = (isset($Param['sort'])) ? GetStringSorting($Param['sort']) : 'user_group_id ASC';
		
		$SelectQuery = "
			SELECT UserGroup.*
			FROM ".USER_GROUP." UserGroup
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
			FROM ".USER_GROUP." UserGroup
			WHERE 1 $StringFilter
		";
		$SelectResult = mysql_query($SelectQuery) or die(mysql_error());
		while (false !== $Row = mysql_fetch_assoc($SelectResult)) {
			$TotalRecord = $Row['TotalRecord'];
		}
		
		return $TotalRecord;
	}
	
	function Delete($Param) {
		if (isset($Param['user_id'])) {
			$DeleteQuery  = "DELETE FROM ".USER_GROUP." WHERE user_id = '".$Param['user_id']."' LIMIT 1";
			$DeleteResult = mysql_query($DeleteQuery) or die(mysql_error());

		} else {
			$DeleteQuery  = "DELETE FROM ".USER_GROUP." WHERE user_group_id = '".$Param['user_group_id']."' LIMIT 1";
			$DeleteResult = mysql_query($DeleteQuery) or die(mysql_error());
		}
		
		$Result['QueryStatus'] = '1';
		$Result['Message'] = 'Data berhasil dihapus.';
		
		return $Result;
	}
}