import {h} from 'preact';
import {MemberEntryRenderable} from '../entities/renderables';
import {ClassMember} from './class-member';

export function ClassMemberList(props: {members: MemberEntryRenderable[]}) {
  return (
    <div className="adev-reference-members">
      {props.members.map(member => <ClassMember member={member} />)}
    </div>
  );
}
