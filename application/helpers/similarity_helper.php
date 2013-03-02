<?php
if (! class_exists('Similarity')) {
	class Similarity {
		function __construct($Primary, $Secondary) {
			$this->Result = 0;
			$this->Primary = $Primary;
			$this->Secondary = $Secondary;
			
			$this->Proccess();
		}
		
		function Proccess() {
			$ArrayRate = array(0, 0);
			$this->ArrayMerge = array();
			foreach ($this->Primary as $Key => $Value) {
				if (isset($this->Primary[$Key]) && isset($this->Secondary[$Key])) {
					$ArrayRate[0] += $this->Primary[$Key];
					$ArrayRate[1] += $this->Secondary[$Key];
					$this->ArrayMerge[] = array( $this->Primary[$Key], $this->Secondary[$Key] );
				}
			}
			
			// Get User Count and return if no user set a rating
			$CountUser = count($this->ArrayMerge);
			if (empty($CountUser)) {
				return;
			}
			
			
			// Get Final Rate
			foreach ($ArrayRate as $Key => $Value) {
				$this->ArrayRate[$Key] = number_format($Value / $CountUser, 2, '.', '');
			}
			
			
			#region Similarity
			#Make it two proccess to make is easier to learn
			
			// Get Upper Value
			$UpperValue = 0;
			foreach ($this->ArrayMerge as $Array) {
				$UpperValue += ($Array[0] - $this->ArrayRate[0]) * ($Array[1] - $this->ArrayRate[1]);
			}
			
			// Get Lower Value
			$LeftSite = $RightSite = $LowerValue = 0;
			foreach ($this->ArrayMerge as $Array) {
				$LeftSite += pow($Array[0] - $this->ArrayRate[0], 2);
				$RightSite += pow($Array[1] - $this->ArrayRate[1], 2);
			}
			$LowerValue = sqrt($LeftSite) * sqrt($RightSite);
			
			#endregion Similarity
			
			if (!empty($UpperValue) && !empty($LowerValue)) {
				$this->Result = $UpperValue / $LowerValue;
			}
		}
	}
}

if (! class_exists('Prediction')) {
	class Prediction {
		function __construct($Param) {
			$this->Result = 0;
			$this->item_data = $Param['item_data'];
			$this->item_average = $Param['item_average'];
			
			$this->Proccess($Param);
		}
		
		function Proccess($Param) {
			$ScoreUpper = 0;
			$ScoreLower = 0;
			foreach ($Param['item_data'] as $Array) {
				$ScoreUpper += ($Array['user_score'] - $Array['average_score']) * $Array['similarity'];
				$ScoreLower += $Array['similarity'];
			}
			
			if (empty($ScoreLower)) {
				$this->Result = $Param['item_average'];
			} else {
				$this->Result = $Param['item_average'] + ($ScoreUpper / $ScoreLower);
			}
		}
	}
}
?>