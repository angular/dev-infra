import {h} from 'preact';
import {MemberEntryRenderable} from '../entities/renderables';
import {ClassMethodInfo} from './class-method-info';
import {RawHtml} from './raw-html';

export function ClassMember(props: {member: MemberEntryRenderable}) {
  const member = props.member;

  return (
    <div id={member.name} class="adev-reference-member-card">
      <header>
        <h3>{member.name}</h3>
      </header>
      <div className="adev-reference-card-body">
        <RawHtml value={member.htmlDescription} />

        {/*TODO: deprecated marker*/}

        <ClassMethodInfo member={member} />
      </div>
    </div>
  );
}
