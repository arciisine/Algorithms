import * as compute from './compute/index';
import * as optimization from './optimization/index';
import * as sort from './sort/index';

let sample:{[key:string]:{[key:string]:Algo}} = {
  compute,
  optimization,
  sort
}

type Fn = (...args:any[])=>any;
type Algo = {fn:Fn, sample:any[]|(()=>any[]), globals?:{[key:string]:Fn}}

export {sample,Algo};