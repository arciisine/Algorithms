export default function init() {
  angular
    .module("Algorithm", ['ngMaterial','ui.ace'])
    .config(function($mdThemingProvider) {
      $mdThemingProvider.theme('altTheme')
        .primaryPalette('blue');
      $mdThemingProvider.setDefaultTheme('altTheme');  
    })
    .controller("Test", function() {
      
    })
  
  
  document.onload = function() {
    angular.bootstrap(document.body, ['Algorithm'])
  }
}