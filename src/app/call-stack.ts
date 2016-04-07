import * as _ from "lodash";
import * as d3 from "d3";

export let CallStackDirective = [function($timeout) {  
  return {
    restrict : 'E',
    scope : {
      stack : '=',
    },
    template : `              
      <md-list flex>
        <div ng-repeat="item in stack">
          <md-list-item class="md-3-line"" ng-click="null">
            <div class="md-list-item-text" layout="column">
              <h3>{{item.id}}</h3>
              <p>{{item.args}}</p>
            </div>
          </md-list-item>
          <md-divider ></md-divider>
        </div>
      </md-list>`
  }
}];