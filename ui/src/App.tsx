import React from "react";
import {v4 as uuidv4} from 'uuid';
import "./stylesheets/styles.scss";
import Header from "./components/Header";
import Body from "./components/Body";
import {CreateQueueCommand, DeleteMessageCommand, ReceiveMessageCommand} from "@aws-sdk/client-sqs";
import {sqsClient} from "./libs/sqsClient";
import {Container} from "@mui/material";

export default class App extends React.Component<{}, { uuid: string }> {
    constructor(props: {}) {
        super(props);
        this.state = {
            uuid: uuidv4(),
        };
    }

    render() {
        return (
            <Container id={"app-container"}>
                <Header/>
                <Body uuid={this.state.uuid}
                      createSQSQueue={() => createSQSQueue(this.state.uuid)}
                      getMessage={getMessage}
                      deleteMessage={deleteMessage}
                />
            </Container>
        );
    }
}

async function createSQSQueue(uuid: string) {
    const params = {
        QueueName: "upload_" + uuid, Attributes: {
            DelaySeconds: "0", MessageRetentionPeriod: "86400"
        }
    };

    try {
        const data = await sqsClient.send(new CreateQueueCommand(params));
        return data;
    } catch (err) {

    }
}

async function getMessage(queueURL: string) {
    const params = {
        AttributeNames: ["SentTimestamp"],
        MaxNumberOfMessages: 1,
        MessageAttributeNames: ["All"],
        QueueUrl: queueURL,
        WaitTimeSeconds: 20,
    }

    try {
        const data = await sqsClient.send(new ReceiveMessageCommand(params));
        return data; // For unit tests.
    } catch (err) {
    }
}

async function deleteMessage(queueURL: string, receiptHandle: string) {
    const params = {
        QueueUrl: queueURL, ReceiptHandle: receiptHandle
    }

    try {
        const data = await sqsClient.send(new DeleteMessageCommand(params));
    } catch (err) {
    }
}
