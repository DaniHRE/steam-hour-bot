import AppSidebar from '@/components/AppSidebar';
import { Container } from '../components/Container';
import ClientInfo from '@/components/ClientInfo';

const mockClients = [
    {
        id: "30ad6173-3d96-4368-817d-d2783a69dc2b",
        avatar: 'https://avatars.githubusercontent.com/u/67109815?v=4',
        name: 'Corno master',
        status: 'Online',
        uptime: 1735611439644,
        games: [
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/304930/e18009fb628b35953826efe47dc3be556b689f4c.jpg",
                name: "Game 1"
            },
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/578080/609f27278aa70697c13bf99f32c5a0248c381f9d.jpg",
                name: "Game 2"
            },
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/730/8dbc71957312bbd3baea65848b545be9eae2a355.jpg",
                name: "Game 3"
            }
        ]
    },
    {
        id: "066dc7f4-71cd-4a8e-9e58-3f5ee20c04ca",
        avatar: 'https://avatars.fastly.steamstatic.com/9880809d8aa0329e989057312a673468a2e56488_full.jpg',
        name: 'Arroz com feijão é muito bom mesmo',
        status: 'Offline',
        uptime: 1735611439644,
        games: [
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/304930/e18009fb628b35953826efe47dc3be556b689f4c.jpg",
                name: "Game 1"
            },
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/578080/609f27278aa70697c13bf99f32c5a0248c381f9d.jpg",
                name: "Game 2"
            },
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/730/8dbc71957312bbd3baea65848b545be9eae2a355.jpg",
                name: "Game 3"
            }
        ]
    },
    {
        id: "066dc7f4-71cd-4a8e-9e58-3f5ee20c04ca",
        avatar: "https://avatars.cloudflare.steamstatic.com/9978d0fc182121ad37da16262eb3b304ed81540b_full.jpg",
        name: 'Arroz com feijão é muito bom mesmo',
        status: 'Offline',
        uptime: 1735611439644,
        games: [
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/304930/e18009fb628b35953826efe47dc3be556b689f4c.jpg",
                name: "Game 1"
            },
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/578080/609f27278aa70697c13bf99f32c5a0248c381f9d.jpg",
                name: "Game 2"
            },
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/730/8dbc71957312bbd3baea65848b545be9eae2a355.jpg",
                name: "Game 3"
            }
        ]
    },
    {
        id: "066dc7f4-71cd-4a8e-9e58-3f5ee20c04ca",
        avatar: 'https://avatars.fastly.steamstatic.com/9880809d8aa0329e989057312a673468a2e56488_full.jpg',
        name: '| D I N O |',
        status: 'Online',
        uptime: 1735611439644,
        games: [
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/304930/e18009fb628b35953826efe47dc3be556b689f4c.jpg",
                name: "Game 1"
            },
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/578080/609f27278aa70697c13bf99f32c5a0248c381f9d.jpg",
                name: "Game 2"
            },
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/730/8dbc71957312bbd3baea65848b545be9eae2a355.jpg",
                name: "Game 3"
            },
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/578080/609f27278aa70697c13bf99f32c5a0248c381f9d.jpg",
                name: "Game 2"
            },
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/578080/609f27278aa70697c13bf99f32c5a0248c381f9d.jpg",
                name: "Game 2"
            },
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/578080/609f27278aa70697c13bf99f32c5a0248c381f9d.jpg",
                name: "Game 2"
            },
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/578080/609f27278aa70697c13bf99f32c5a0248c381f9d.jpg",
                name: "Game 2"
            },
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/578080/609f27278aa70697c13bf99f32c5a0248c381f9d.jpg",
                name: "Game 2"
            },
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/578080/609f27278aa70697c13bf99f32c5a0248c381f9d.jpg",
                name: "Game 2"
            },
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/578080/609f27278aa70697c13bf99f32c5a0248c381f9d.jpg",
                name: "Game 2"
            },
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/578080/609f27278aa70697c13bf99f32c5a0248c381f9d.jpg",
                name: "Game 2"
            },
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/578080/609f27278aa70697c13bf99f32c5a0248c381f9d.jpg",
                name: "Game 2"
            },
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/578080/609f27278aa70697c13bf99f32c5a0248c381f9d.jpg",
                name: "Game 2"
            },
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/578080/609f27278aa70697c13bf99f32c5a0248c381f9d.jpg",
                name: "Game 2"
            },
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/578080/609f27278aa70697c13bf99f32c5a0248c381f9d.jpg",
                name: "Game 2"
            },
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/578080/609f27278aa70697c13bf99f32c5a0248c381f9d.jpg",
                name: "Game 2"
            },
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/578080/609f27278aa70697c13bf99f32c5a0248c381f9d.jpg",
                name: "Game 2"
            },
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/578080/609f27278aa70697c13bf99f32c5a0248c381f9d.jpg",
                name: "Game 2"
            },
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/578080/609f27278aa70697c13bf99f32c5a0248c381f9d.jpg",
                name: "Game 2"
            },
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/578080/609f27278aa70697c13bf99f32c5a0248c381f9d.jpg",
                name: "Game 2"
            },
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/578080/609f27278aa70697c13bf99f32c5a0248c381f9d.jpg",
                name: "Game 2"
            },
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/578080/609f27278aa70697c13bf99f32c5a0248c381f9d.jpg",
                name: "Game 2"
            }
        ]
    },
    {
        id: "066dc7f4-71cd-4a8e-9e58-3f5ee20c04ca",
        avatar: 'https://avatars.fastly.steamstatic.com/9880809d8aa0329e989057312a673468a2e56488_full.jpg',
        name: 'Arroz com feijão é muito bom mesmo',
        status: 'Offline',
        uptime: 1735611439644,
        games: [
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/304930/e18009fb628b35953826efe47dc3be556b689f4c.jpg",
                name: "Game 1"
            },
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/578080/609f27278aa70697c13bf99f32c5a0248c381f9d.jpg",
                name: "Game 2"
            },
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/730/8dbc71957312bbd3baea65848b545be9eae2a355.jpg",
                name: "Game 3"
            }
        ]
    },
    {
        id: "066dc7f4-71cd-4a8e-9e58-3f5ee20c04ca",
        avatar: 'https://avatars.fastly.steamstatic.com/9880809d8aa0329e989057312a673468a2e56488_full.jpg',
        name: 'Arroz com feijão é muito bom mesmo',
        status: 'Offline',
        uptime: 1735611439644,
        games: [
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/304930/e18009fb628b35953826efe47dc3be556b689f4c.jpg",
                name: "Game 1"
            },
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/578080/609f27278aa70697c13bf99f32c5a0248c381f9d.jpg",
                name: "Game 2"
            },
            {
                logo: "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/730/8dbc71957312bbd3baea65848b545be9eae2a355.jpg",
                name: "Game 3"
            }
        ]
    }
]

export const Home = () => {
    return (
        <>
            <AppSidebar />
            <Container variant="breakpointPadded" className=''>
                <h1 className="scroll-m-20 text-lg font-extrabold tracking-tight lg:text-5xl md:text-3xl lg:pt-6 md:pt-6 pt-8">
                    Clients
                </h1>
                <div className='flex flex-wrap max-w-full w-full h-full mt-4 gap-4'>
                    {mockClients.map((client) => <ClientInfo key={client.name} client={client} />)}
                </div>
            </Container>
        </>
    );
}
