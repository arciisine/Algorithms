'use strict';

angular
  .module("Algorithm", ['ngMaterial','ui.ace'])
  .config(function($mdThemingProvider) {
    $mdThemingProvider.theme('altTheme')
      .primaryPalette('blue');
    $mdThemingProvider.setDefaultTheme('altTheme');  
  })
  .controller("Test", function() {
    
  })
 
 
 