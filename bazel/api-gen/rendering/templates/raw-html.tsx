import {h} from 'preact';

/** Convenience component to render raw html */
export function RawHtml(props: {value: string}) {
  // Unfortunately, there does not seem to be a way to render the raw html
  // into a text node without introducing a div.
  return <div dangerouslySetInnerHTML={({__html: props.value})}></div>;
}
