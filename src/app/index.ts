import {AnalyzerController} from './analyzer';
import {CallHierarchyDirective} from './call-hierarchy';

export default function init() {
  console.log("Initializing");
  
  angular
    .module("Algorithm", ['ngMaterial','ui.ace'])
    .config(function($mdThemingProvider) {
      $mdThemingProvider.theme('altTheme')
        .primaryPalette('blue');
      $mdThemingProvider.setDefaultTheme('altTheme');  
    })
    .controller("AnalyzerController", AnalyzerController)
    .directive("callHierarchy", CallHierarchyDirective)
  
  
    angular.bootstrap(document, ['Algorithm'])
}