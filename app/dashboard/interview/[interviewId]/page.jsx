"use client"
import { Button } from '@/components/ui/button'
import { db } from '@/utils/db'
import { MockInterview } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import { Lightbulb, WebcamIcon } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React, { use, useEffect, useState } from 'react'
import Webcam from 'react-webcam'

function Interview (){

     const params = useParams();

    const [interviewData, setInterviewData] = useState();
    const [webCamEnabled, setWebCamEnabled] = useState(false);

    useEffect(() => {
        GetInterviewDetails();
    }, [])

    /**
     * Used to Get Interview Details by MockID/Interview ID
     */

    const GetInterviewDetails = async () => {
        const result = await db.select().from(MockInterview)
            .where(eq(MockInterview.mockId, params.interviewId))

        setInterviewData(result[0]);
    }

    return (
        <div className='my-10 '>
            <h2 className='font-bold text-2xl flex justify-center flex-col items-center'>Let's Get Started</h2>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
                <div >
                    {interviewData ? (
                        <div style={{ height: 300 }} className="flex flex-col my-7 gap-5">
                            <div className='flex flex-col p-5 rounded-lg border gap-5'>
                                <h2 className="text-lg">
                                    <strong>Job Role/Job Position : </strong>{interviewData.jobPosition}
                                </h2>
                                <h2 className="text-lg">
                                    <strong>Job Description/Tech Stack : </strong>{interviewData.jobDesc}
                                </h2>
                                <h2 className="text-lg">
                                    <strong>Years of Experience : </strong>{interviewData.jobExperience}
                                </h2>
                            </div>

                            <div className='p-5 border rounded-lg border-yellow-300 bg-yellow-100'>
                                <h2 className='flex gap-2 items-center text-yellow-600'><Lightbulb/><strong>Information</strong></h2>
                                <h2 className='mt-3 text-yellow-600'>{process.env.NEXT_PUBLIC_INFORMATION}</h2>
                            </div>

                        </div>

                        
                    ) : (
                        <p className="text-red-500">Interview not found or loading...</p>
                    )}
                </div>

                <div>
                    {webCamEnabled ? <Webcam className='ml-40'
                        onUserMedia={() => setWebCamEnabled(true)}
                        onUserMediaError={() => setWebCamEnabled(false)}
                        mirrored={true}
                        style={{
                            height: 300,
                            width: 300
                        }}
                    />
                        :
                        <>
                            <WebcamIcon className='h-72 w-full my-7 p-20 bg-secondary rounded-lg border' />
                            <Button variant='ghost' className='ml-40' onClick={() => setWebCamEnabled(true)}>Enable Web Camera and Microphone</Button>
                        </>
                    }
                </div>
            </div>
            <div className='flex justify-end items-end mt-5 mr-60' >
               <Link href={'/dashboard/interview/'+params.interviewId+'/start'}>
                <Button >Start Interview</Button>
               </Link>
            </div>
        </div>
    )
}

export default Interview;