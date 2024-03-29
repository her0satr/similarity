<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Item_model extends CI_Model {
	function __construct() {
        parent::__construct();
		
		$this->Field = array('item_id', 'movie_title', 'release_date', 'video_release_date', 'imdb_url', 'unknown', 'action', 'adventure', 'animation', 'childrens', 'comedy', 'crime', 'documentary', 'drama', 'fantasy', 'filmnoir', 'horror', 'musical', 'mystery', 'romance', 'scifi', 'thriller', 'war', 'western');
    }
	
	function Update($Param) {
		$Result = array();
		
		if (empty($Param['item_id'])) {
			$InsertQuery  = GenerateInsertQuery($this->Field, $Param, ITEM);
			$InsertResult = mysql_query($InsertQuery) or die(mysql_error());
			
			$Result['item_id'] = mysql_insert_id();
			$Result['QueryStatus'] = '1';
			$Result['Message'] = 'Data berhasil tersimpan.';
		} else {
			$UpdateQuery  = GenerateUpdateQuery($this->Field, $Param, ITEM);
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
				SELECT Item.*
				FROM ".ITEM." Item
				WHERE Item.item_id = '".$Param['item_id']."' LIMIT 1";
		}
		
		$SelectResult = mysql_query($SelectQuery) or die(mysql_error());
		if (false !== $Row = mysql_fetch_assoc($SelectResult)) {
			$Array = StripArray($Row);
		}
		
		return $Array;
	}
	
	function GetArray($Param = array()) {
		$Array = array();
		
		$ForceDisplayID = (isset($Param['ForceDisplayID'])) ? $Param['ForceDisplayID'] : 0;
		$StringSearch = (isset($Param['NameLike'])) ? "AND movie_title LIKE '%" . $Param['NameLike'] . "%'"  : '';
		$StringFilter = GetStringFilter($Param);
		
		$PageOffset = (isset($Param['start']) && !empty($Param['start'])) ? $Param['start'] : 0;
		$PageLimit = (isset($Param['limit']) && !empty($Param['limit'])) ? $Param['limit'] : 25;
		$StringSorting = (isset($Param['sort'])) ? GetStringSorting($Param['sort']) : 'movie_title ASC';
		
		$SelectQuery = "
			SELECT Item.*
			FROM ".ITEM." Item
			WHERE 1 $StringSearch $StringFilter
			ORDER BY $StringSorting
			LIMIT $PageOffset, $PageLimit
		";
		$SelectResult = mysql_query($SelectQuery) or die(mysql_error());
		while (false !== $Row = mysql_fetch_assoc($SelectResult)) {
			if (!empty($ForceDisplayID)) {
                $ForceDisplayID = ($ForceDisplayID == $Row['item_id']) ? 0 : $ForceDisplayID;
            }
			
			$Row = StripArray($Row);
			$Array[] = $Row;
		}
		
        if (!empty($ForceDisplayID)) {
            $ArrayForce = $this->GetByID(array('item_id' => $ForceDisplayID));
			if (count($ArrayForce) > 0) {
				$Array[] = $ArrayForce;
			}
        }
		
		return $Array;
	}
	
	function GetCount($Param = array()) {
		$TotalRecord = 0;
		
		$StringSearch = (isset($Param['NameLike'])) ? "AND movie_title LIKE '%" . $Param['NameLike'] . "%'"  : '';
		$StringFilter = GetStringFilter($Param);
		
		$SelectQuery = "
			SELECT COUNT(*) AS TotalRecord
			FROM ".ITEM." Item
			WHERE 1 $StringSearch $StringFilter
		";
		$SelectResult = mysql_query($SelectQuery) or die(mysql_error());
		while (false !== $Row = mysql_fetch_assoc($SelectResult)) {
			$TotalRecord = $Row['TotalRecord'];
		}
		
		return $TotalRecord;
	}
	
	function get_next_item($item_id) {
		$next_item_id = 0;
		
		$SelectQuery  = "SELECT Item.* FROM ".ITEM." Item WHERE Item.item_id > '".$item_id."' ORDER BY Item.item_id ASC LIMIT 1";
		$SelectResult = mysql_query($SelectQuery) or die(mysql_error());
		if (false !== $Row = mysql_fetch_assoc($SelectResult)) {
			$Item = StripArray($Row);
			$next_item_id = $Item['item_id'];
		}
		
		return $next_item_id;
	}
	
	function get_item_without_rate($user_id, $limit = 2000) {
		$Array = array();
		$SelectQuery  = "
			SELECT
				Item.item_id, Item.movie_title,
				(SELECT rating FROM ".DATA." Data WHERE Data.item_id = Item.item_id AND user_id = '$user_id') rating
			FROM ".ITEM." Item
			ORDER BY rating ASC
			LIMIT $limit
		";
		$SelectResult = mysql_query($SelectQuery) or die(mysql_error());
		while (false !== $Row = mysql_fetch_assoc($SelectResult)) {
			if (!empty($Row['rating'])) {
				break;
			}
			
			$Array[] = $Row;
		}
		
		return $Array;

	}
	
	function Delete($Param) {
		$DeleteQuery  = "DELETE FROM ".ITEM." WHERE item_id = '".$Param['item_id']."' LIMIT 1";
		$DeleteResult = mysql_query($DeleteQuery) or die(mysql_error());
		
		$Result['QueryStatus'] = '1';
		$Result['Message'] = 'Data berhasil dihapus.';
		
		return $Result;
	}
}