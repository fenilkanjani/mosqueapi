/*
 * mosquefinder
 * 
 * Author: Fenil Kanjani (2016)
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
			$scope.areaList = [];

			$http.get('/getareas').then(function (success) {
				$scope.areaList = success.data.areas;
			}, function () {
				alert('something went wrong while fetching areas');
			});

			$scope.selectedArea = '';
			$scope.mosqueList = [];
			$scope.selectedMosque = '';
			$scope.timings = '';

			$scope.timeList = [
				'06:00', '06:15', '06:30', '06:45',
				'07:00', '07:15', '07:30', '07:45',
				'08:00', '08:15', '08:30', '08:45',
				'09:00', '09:15', '09:30', '09:45',
				'10:00', '10:15', '10:30', '10:45',
				'11:00', '11:15', '11:30', '11:45',
				'12:00', '12:15', '12:30', '12:45',
				'13:00', '13:15', '13:30', '13:45',
				'14:00', '14:15', '14:30', '14:45',
				'15:00', '15:15', '15:30', '15:45',
				'16:00', '16:15', '16:30', '16:45',
				'17:00', '17:15', '17:30', '17:45',
				'18:00', '18:15', '18:30', '18:45',
				'19:00', '19:15', '19:30', '19:45'
			];

			$scope.getMosques = function () {
				if ($scope.selectedArea) {
					$http.get('/querysearch?query=mosques in ' + $scope.selectedArea + ',bangalore')
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
							$scope.timings = success.data.timings || ['', '', '', '', '', ''];
						}, function () {
							alert('something went wrong while fetching timings');
						});
				} else {
					$scope.timings = '';
				}
			}

			$scope.updateTimings = function () {
				$http.post('/updatetimings', {
					google_id: $scope.selectedMosque,
					timings: $scope.timings
				}).then(function () {
					alert('Saved Successfully');
				}, function () {
					alert('something went wrong while saving the timings');
				});
			}
		}
	]);
})(angular);