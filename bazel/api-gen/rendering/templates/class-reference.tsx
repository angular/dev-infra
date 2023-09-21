import {h} from 'preact';
import {ClassEntryRenderable} from '../entities/renderables';
import {ClassMemberList} from './class-member-list';

/** Component to render a class API reference document. */
export function ClassReference(entry: ClassEntryRenderable) {
  return (
      <div className="adev-reference-members">
        <ClassMemberList members={entry.members} />
      </div>
  );
}
