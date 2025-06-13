

async function ReviewIdPage({params}: {params:Promise<any>}) {

    const param = await params

    console.log(param)

    const reviewId = param.reviewId

    //reviewId를 이용해서 패치
    const res = await fetch(`http://localhost:8080/api/reviews/${reviewId}`)
    const data = await res.json()

    console.log(data)

    return (
        <div>
            <div className={'text-4xl'}>Review Id Page</div>
        </div>
    );
}

export default ReviewIdPage;