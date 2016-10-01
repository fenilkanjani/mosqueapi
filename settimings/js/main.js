/*
 * mosquefinder
 * 
 * Author: Fenil Kanjani (2015)
 * @version 1.0
 */
(function (angular) {
	'use strict';
	var module = angular.module('mosqueApp', [

	]);

	module.controller('mosqueController', [
		'$scope',
		'$http',
		function ($scope, $http) {
			$scope.areaList = [
				'jayanagar',
				'btm layout'
			];

			$scope.selectedArea = '';
			$scope.mosqueList = [];
			$scope.selectedMosque = '';
			$scope.timings = '';

			$scope.timeList = ['09:00', '09:30'];

			$scope.getMosques = function () {
				if ($scope.selectedArea) {
					$http.get('/querysearch?query=mosques in ' + $scope.selectedArea + ',banglore')
						.then(function (success) {
							$scope.selectedMosque = '';
							$scope.timings = '';
							$scope.mosqueList = success.data;
						}, function () {
							alert('something went wrong while fetching mosques');
						});
				} else {
					$scope.mosqueList = [];
					$scope.selectedMosque = '';
					$scope.timings = '';
				}
			}

			$scope.getTimings = function () {
				if ($scope.selectedMosque) {
					$http.get('/gettimings?google_id=' + $scope.selectedMosque)
						.then(function (success) {
							$scope.timings = success.data.timings || ['', '', '', '', ''];
						}, function () {
							alert('something went wrong while fetching timings ');
						});
				} else {
					$scope.timings = '';
				}
			}

			$scope.updateTimings = function () {
				$http.post('/updatetimings', {
					google_id: $scope.selectedMosque,
					timings: $scope.timings
				});
			}
		}
	]);
})(angular);