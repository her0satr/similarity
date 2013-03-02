CREATE TABLE IF NOT EXISTS `prediction` (
  `prediction_id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `prediction_value` float NOT NULL,
  PRIMARY KEY (`prediction_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;