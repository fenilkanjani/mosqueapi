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
				if (
					$scope.timings.some(function (timing) {
						if (!timing || !timing.length || timing.length !== 5 || !/^\d{2}:\d{2}$/.test(timing)) {
							return true
						}
					})
				) {
					alert('Timings should have a hh:mm format and should not be empty. Also only numbers 0-9 and \':\' are allowed as input.');
					return;
				}
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