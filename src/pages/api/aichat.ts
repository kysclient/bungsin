import {ChatBody, Message} from "@lib/types/chat";
import {DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE} from "@lib/const";

import {Tiktoken, init} from '@dqbd/tiktoken/lite/init';
import tiktokenModel from '@dqbd/tiktoken/encoders/cl100k_base.json';
// @ts-expect-error
import wasm from "@dqbd/tiktoken/lite/tiktoken_bg.wasm?module";
import {OpenAIError, OpenAIStream} from "@lib/server";


export const config = {
    runtime: 'edge',
    regions: ['iad1']
};

const handler = async (req: Request): Promise<Response> => {
    console.log('handler working !?!?');
    try {
        const {model, messages, key, prompt, temperature} = (await req.json()) as ChatBody;

        await init((imports) => WebAssembly.instantiate(wasm, imports));
        const encoding = new Tiktoken(
            tiktokenModel.bpe_ranks,
            tiktokenModel.special_tokens,
            tiktokenModel.pat_str,
        );

        let promptToSend = prompt;
        if (!promptToSend) {
            promptToSend = DEFAULT_SYSTEM_PROMPT;
        }

        let temperatureToUse = temperature;
        if (temperatureToUse == null) {
            temperatureToUse = DEFAULT_TEMPERATURE;
        }

        const prompt_tokens = encoding.encode(promptToSend);

        let tokenCount = prompt_tokens.length;
        let messagesToSend: Message[] = [];

        for (let i = messages.length - 1; i >= 0; i--) {
            const message = messages[i];
            const tokens = encoding.encode(message.content);

            if (tokenCount + tokens.length + 1000 > model.tokenLimit) {
                break;
            }
            tokenCount += tokens.length;
            messagesToSend = [message, ...messagesToSend];
        }

        encoding.free();
        const stream = await OpenAIStream(model, promptToSend, temperatureToUse, key, messagesToSend);
        return new Response(stream);
    } catch (error) {
        console.error(error);
        if (error instanceof OpenAIError) {
            return new Response('Error', {status: 500, statusText: error.message});
        } else {
            return new Response('Error', {status: 500});
        }
    }
}


export default handler
