/**
 * CommonJS stub of `@nestjs/typeorm` used only by Jest.
 *
 * The real package is ESM-only (`"type": "module"`), which the Jest CJS
 * runtime cannot `require`. Unit tests inject repositories manually, so the
 * real decorators are not needed; these lightweight equivalents keep the DI
 * metadata harmless outside the Nest container.
 */
export const InjectRepository = (): ParameterDecorator => () => undefined;

export const InjectDataSource = (): ParameterDecorator => () => undefined;

export const getRepositoryToken = (entity: unknown): string =>
  `typeorm:repository:${(entity as { name?: string })?.name ?? 'Entity'}`;

export const getDataSourceToken = (): string => 'typeorm:datasource';
