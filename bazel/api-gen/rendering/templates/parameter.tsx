import {h} from 'preact';
import {ParameterEntryRenderable} from '../entities/renderables';
import {RawHtml} from './raw-html';


/** Component to render a function or method parameter reference doc fragment. */
export function Parameter(props: {param: ParameterEntryRenderable}) {
  const param = props.param;

  return (
      <div>
        {/*TODO: isOptional, isRestParam*/}
        <span className="adev-param-keyword">@param</span>
        <span className="adev-param-name">{param.name}</span>
        <code>{param.type}</code>
        <RawHtml value={param.htmlDescription}/>
      </div>
  );
}
