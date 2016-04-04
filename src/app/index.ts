import {CallHierarchy, Directive} from './call-hierarchy';

export default function init() {
  console.log("Initializing");
  
  angular
    .module("Algorithm", ['ngMaterial','ui.ace'])
    .config(function($mdThemingProvider) {
      $mdThemingProvider.theme('altTheme')
        .primaryPalette('blue');
      $mdThemingProvider.setDefaultTheme('altTheme');  
    })
    .controller("CallHierarchy", CallHierarchy)
    .directive("callHierarchy", Directive)
  
  
    angular.bootstrap(document, ['Algorithm'])
}