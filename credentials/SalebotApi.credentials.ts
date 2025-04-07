import {
	Icon,
	ICredentialTestRequest, ICredentialType, INodeProperties
} from "n8n-workflow";

export class SalebotApi implements ICredentialType {
	name = 'salebotApi';
	icon: Icon = 'node:n8n-nodes-base.salebot';

	displayName = 'Salebot API';

	documentationUrl = 'https://docs.salebot.ai/working-with-api/the-editing-softwares-api';

	properties: INodeProperties[] = [
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description:
				'Read <a href="https://docs.salebot.ai/working-with-api/the-editing-softwares-api">documentation</a> to obtain the access token',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://chatter.salebot.ai',
			description: 'Base URL for Salebot API',
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}/api/{{$credentials.accessToken}}',
			url: '/connected_channels',
		},
	};
}
