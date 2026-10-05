import Stage from "./stage";
import ActivityMenu from "./activity-menu";
export default async function Home({searchParams}:{searchParams:Promise<{activity?:string}>}) {const params=await searchParams;return params.activity?<Stage activityId={params.activity}/>:<ActivityMenu/>;}
