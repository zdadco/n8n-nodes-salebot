import {
	apiRequest,
} from './ApiClient';
import {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError
} from "n8n-workflow";
import {Variables} from "./ITypes";

export class Salebot implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Salebot',
		name: 'salebot',
		icon: 'file:salebot.svg',

		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["action"]}}',
		description: 'Sends data to Salebot',
		defaults: {
			name: 'Salebot',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'salebotApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Action',
				name: 'action',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Send Message',
						value: 'message',
					},
					{
						name: 'Send Callback',
						value: 'callback',
					},
					{
						name: 'Save Variables',
						value: 'save_variables',
					},

				],
				default: 'message',
			},

			{
				displayName: 'Client ID',
				name: 'client_id',
				type: 'string',
				default: '',
				required: true
			},

			// ----------------------------------
			//         message
			// ----------------------------------
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						action: ['message']
					},
				},
				description: 'Text of the message to be sent',
			},

			// ----------------------------------
			//         callback
			// ----------------------------------
			{
				displayName: 'Callback',
				name: 'callback',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						action: ['callback']
					},
				},
				description: 'Text of the callback to be sent',
			},

			// ----------------------------------
			//         save_variables
			// ----------------------------------
			{
				displayName: 'Variables',
				name: 'variables',
				type: 'fixedCollection',
				description: 'Variables to be saved in client',
				typeOptions: {
					multipleValues: true
				},
				default: {},
				displayOptions: {
					show: {
						action: ['callback', 'save_variables']
					},
				},
				options: [
					{
						name: 'variablePairs',
						displayName: 'Variable',
						values: [
							{
								displayName: 'Variable Name',
								name: 'key',
								type: 'string',
								default: '',
								placeholder: 'e.g. client.email',
								description: 'The name of the variable (e.g., "client.email")',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'The value of the variable',
							},
						],
					},
				]
			},
		]
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// For Post
		let body: IDataObject;
		// For Query string
		let qs: IDataObject;

		let requestMethod: IHttpRequestMethods;
		let endpoint: string;

		const action = this.getNodeParameter('action', 0);

		for (let i = 0; i < items.length; i++) {
			try {
				// Reset all values
				requestMethod = 'POST';
				endpoint = '';
				body = {};
				qs = {};

				body.client_id = this.getNodeParameter('client_id', i) as string;

				if (action === 'message') {
					endpoint = 'message';

					body.message = this.getNodeParameter('message', i) as string;
				} else if (action === 'callback') {
					endpoint = 'callback';

					body.message = this.getNodeParameter('callback', i) as string;

					const variables = this.getNodeParameter('variables.variablePairs', i, []) as Array<Variables>;
					variables.forEach(variable => body[variable.key] = variable.value)
				} else if (action === 'save_variables') {
					endpoint = 'save_variables';

					const variablePairs = this.getNodeParameter('variables.variablePairs', i, []) as Array<Variables>;
					const variables: { [key: string]: any } = {}
					variablePairs.forEach(pair => variables[pair.key] = pair.value)
					body.variables = variables
				} else {
					throw new NodeOperationError(this.getNode(), `The resource "${action}" is not known!`, {
						itemIndex: i,
					});
				}

				const responseData = await apiRequest.call(this, requestMethod, endpoint, body, qs);
				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as IDataObject[]),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: {}, error: error.message });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
