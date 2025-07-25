"use client"
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import Webcam from 'react-webcam';
import useSpeechToText from 'react-hook-speech-to-text';
import { Mic, StopCircle } from 'lucide-react';
import { toast } from 'sonner';
import { chatSession } from '@/utils/GeminiAIModal';
import { useUser } from '@clerk/nextjs';
import { db } from '@/utils/db';
import { UserAnwer } from '@/utils/schema';
import moment from 'moment';

function RecordAnswerSection({ mockIntervieQuestoins, activeQuestionIndex, interviewData }) {
    const [userAnswer, setUserAnswer] = useState('');
    const { user } = useUser();
    const [loading, setLoading] = useState(false);


    const {
        error,
        interimResult,
        isRecording,
        results,
        startSpeechToText,
        stopSpeechToText,
        setResults,
    } = useSpeechToText({
        continuous: true,
        useLegacyResults: false
    });

    useEffect(() => {
        results.map((result) => (
            setUserAnswer(prevAns => prevAns + result?.transcript)
        ))
    }, [results])

    useEffect(()=>{
    if(!isRecording&&userAnswer.length>10){
        UpdateUserAnswer();
    }
    },[userAnswer])


    const StartStopRecording = async () => {
        if (isRecording) {
            stopSpeechToText();
        } else {
            startSpeechToText();
        }
    }

    const UpdateUserAnswer = async () => {

        console.log(userAnswer)
        setLoading(true);
        const feedbackPrompt = "Question" + mockIntervieQuestoins[activeQuestionIndex]?.Question +
            ", User Answer:" + userAnswer + ",Depends on question and user answer for give interview question" +
            "please give us rating for answer and feedback as area of improvment if any" +
            "in just 3 to 5 lines to improve it in JSON format with rating field and feedback field";

        const result = await chatSession.sendMessage(feedbackPrompt);

        const mockJsonResp = (result.response.text()).replace('```json', '').replace('```', '');
        console.log(mockJsonResp);
        const JsonFeedbackResp = JSON.parse(mockJsonResp);

        const resp = await db.insert(UserAnwer)
            .values({
                mockIdRef: interviewData?.mockId,
                question: mockIntervieQuestoins[activeQuestionIndex]?.Question,
                correctAns: mockIntervieQuestoins[activeQuestionIndex]?.Answer,
                userAns: userAnswer,
                feedback: JsonFeedbackResp?.feedback,
                rating: JsonFeedbackResp?.rating,
                userEmail: user?.primaryEmailAddress?.emailAddress,
                createdAt: moment().format('DD-MM-yyyy')
            })

        if (resp) {
            toast('Your Answer recorded successfully')
            setUserAnswer('');
            setResults([]);
        }
        setResults([]);
        setLoading(false);
    }


    return (
        <div className='flex flex-col items-center justify-center'>
            <div className='flex flex-col mt-20 justify-center items-center bg-black rounded-lg p-5 '>
                <Image src={'/webcam11.svg'} width={200} height={200} className='absolute' alt='Web camera' />
                <Webcam
                    mirrored={true}
                    style={{
                        height: 300,
                        width: '100%',
                        zIndex: 10,
                    }}
                />
            </div>
            <Button disabled={loading} variant="outline" className="my-10"
                onClick={StartStopRecording}
            >
                {isRecording ?
                    <h2 className='text-red-600 animate-pulse flex gap-2 text-xs'>
                        <StopCircle /> Stop Recording
                    </h2>
                    :
                    <h2 className='text-primary flex gap-2 items-center'>
                        <Mic size={70} />Record Answer
                    </h2>}</Button>

            

        </div>
    )
}

export default RecordAnswerSection;