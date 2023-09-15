import {Fragment, h} from 'preact';
import {isClassMethodEntry} from '../entities/categorization';
import {MemberEntryRenderable, ParameterEntryRenderable} from '../entities/renderables';
import {Parameter} from './parameter';
import {RawHtml} from './raw-html';

/**
 * Component to render the method-specific parts of a class's API reference.
 * Returns an empty fragment if the member is not a method.
 */
export function ClassMethodInfo(props: { member: MemberEntryRenderable }) {
  const member = props.member;

  if (!isClassMethodEntry(member)) return <></>;

  return (
      <>
        {member.params.map((param: ParameterEntryRenderable) => <Parameter param={param}/>)}
        <div>
          <span class="adev-param-keyword">@returns</span>
          <code>{member.returnType}</code>
          <RawHtml value={member.htmlDescription}/>
        </div>
      </>
  );
}
