/*
 * areas
 * 
 * Author: Fenil Kanjani (2016)
 * @version 1.0
 */
(function (angular) {
	'use strict';
	var module = angular.module('areasApp', [

	]);

	module.controller('areasController', [
		'$scope',
		'$http',
		function ($scope, $http) {
			$scope.areas = [];

			$http.get('/getareas').then(function (success) {
				$scope.areas = success.data.areas;
			}, function () {
				alert('something went wrong while fetching areas');
			});

			$scope.clearNewArea = function () {
				$scope.newArea = {
					name: '',
					pincode: '',
					zone:''
				};
			}

			$scope.clearNewArea();

			$scope.saveArea = function () {
				var userResp = confirm('Are you sure you want to save new area?');
				if (userResp == true) {
				    $http.post('/setarea', {
				    	name: $scope.newArea.name,
				    	pincode: $scope.newArea.pincode,
				    	zone: $scope.newArea.zone
				    }).then(function (success) {
				    	$scope.areas.push(success.data.data);
				    	$scope.clearNewArea();
			    		alert('Area saved successfully');
			    	}, function () {
			    		alert('something went wrong while saving the area');
			    	});
				}
			}

			$scope.saveEditedArea = function (area) {
				var userResp = confirm('Are you sure you want to save the edited area details?');
				if (userResp == true) {
				    $http.patch('/setarea/' + area.id, {
				    	name: area.nameEdit,
				    	pincode: area.pincodeEdit,
				    	zone: area.zoneEdit
				    }).then(function (success) {
				    	area.name = area.nameEdit;
				    	area.pincode = area.pincodeEdit;
				    	area.zone = area.zoneEdit;
				    	area.editMode = false;
			    		alert('Area edited successfully');
			    	}, function () {
			    		alert('something went wrong while editing the area');
			    	});
				}
			}

			$scope.deleteArea = function (area) {
				var userResp = confirm('Are you sure you want to delete this area?');
				if (userResp == true) {
				    $http.delete('/deletearea/' + area.id).then(function (success) {
				    	$scope.areas.some(function (currentArea, index) {
				    		if (currentArea.id === area.id) {
				    			$scope.areas.splice(index, 1);
				    			return true;
				    		}
				    	});
			    		alert('Area deleted successfully');
			    	}, function () {
			    		alert('something went wrong while deleting the area');
			    	});
				}
			}
		}
	]);
})(angular);