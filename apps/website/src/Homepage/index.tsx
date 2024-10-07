import { APP_DESCRIPTION, APP_TITLE } from '~/config';

export function Homepage() {
    return (
        <div className='space-y-4 max-w-lg w-full'>
            <div className='text-xl font-semibold'>{APP_TITLE}</div>
            <p>{APP_DESCRIPTION}</p>
        </div>
    )
}