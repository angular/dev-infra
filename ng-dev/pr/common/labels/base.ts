export const createTypedObject = <T extends new (...args: any) => any>(LabelConstructor: T) => {
  return (val: Record<PropertyKey, ConstructorParameters<T>[0]>) => {
    for (const key in val) {
      val[key] = new LabelConstructor(val[key]);
    }
    return val as unknown as Record<PropertyKey, InstanceType<T>>;
  };
};

export interface LabelParams {
  /* The label string. */
  name: string;
  /* The label description. */
  description: string;
  /* The hexadecimal color code for the label, without the leading */
  color?: string;
  /** The repositories the label is to be used in. */
  repositories?: ManagedRepositories[];
}

export class Label<T extends LabelParams = LabelParams> {
  /** The repositories the label is to be used in. */
  repositories = this.params.repositories || [
    ManagedRepositories.ANGULAR,
    ManagedRepositories.ANGULAR_CLI,
    ManagedRepositories.COMPONENTS,
    ManagedRepositories.DEV_INFRA,
  ];
  /* The label string. */
  name = this.params.name;
  /* The label description. */
  description = this.params.description;
  /* The hexadecimal color code for the label, without the leading */
  color = this.params.color;

  constructor(public readonly params: T) {}
}

export enum ManagedRepositories {
  COMPONENTS = 'components',
  ANGULAR = 'angular',
  ANGULAR_CLI = 'angular-cli',
  DEV_INFRA = 'dev-infra',
}
