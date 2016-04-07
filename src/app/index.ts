import {AnalyzerController} from './analyzer';
import {CallHierarchyDirective} from './call-hierarchy';
import {CallStackDirective} from './call-stack';

export default function init() {
  console.log("Initializing");
  
  angular
    .module("Algorithm", ['ngMaterial','ui.ace'])
    .config(function($mdThemingProvider) {
      $mdThemingProvider.theme('altTheme')
        .primaryPalette('blue');
      $mdThemingProvider.setDefaultTheme('altTheme');  
    })
    .controller("AnalyzerController", AnalyzerController.$inject.slice(0).concat([AnalyzerController] as any))
    .directive("callHierarchy", CallHierarchyDirective)
    .directive("callStack", CallStackDirective)
  
  
    angular.bootstrap(document, ['Algorithm'])
}