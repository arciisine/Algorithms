import * as compute from './compute/index';
import * as optimization from './optimization/index';
import * as sort from './sort/index';

let samples:{[key:string]:{[key:string]:Algo}} = {
  compute,
  optimization,
  sort
}

type Fn = (...args:any[])=>any;
type Algo = {fn:Fn, input:any[]|(()=>any[]), globals?:{[key:string]:Fn}}

export {samples,Algo};