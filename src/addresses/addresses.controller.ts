import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthUser, GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

const addressExample = {
  id: 1,
  name: 'Nandhu Santhosh',
  country: 'India',
  flatHouseBuilding: 'Munjanattu House',
  mobileNumber: '6238973581',
  alternativeMobileNumber: '8078785794',
  pincode: '689667',
  city: 'Seethathodu',
  state: 'Kerala',
  isDefault: true,
};

const addressBody = {
  name: 'Nandhu Santhosh',
  country: 'India',
  flatHouseBuilding: 'Munjanattu House',
  mobileNumber: '6238973581',
  alternativeMobileNumber: '8078785794',
  pincode: '689667',
  city: 'Seethathodu',
  state: 'Kerala',
  isDefault: true,
};

@ApiTags('Addresses')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private addressesService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: 'Get my addresses' })
  @ApiResponse({
    status: 200,
    description: 'List of addresses for the current user',
    schema: { example: { status: true, data: [addressExample] } },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@GetUser() user: AuthUser) {
    return this.addressesService.findAll(user.id);
  }

  @Post()
  @ResponseMessage('Address added successfully')
  @ApiOperation({ summary: 'Add an address' })
  @ApiBody({
    type: CreateAddressDto,
    examples: { address: { summary: 'Add address body', value: addressBody } },
  })
  @ApiResponse({
    status: 201,
    description: 'Address created',
    schema: {
      example: {
        status: true,
        message: 'Address added successfully',
        data: addressExample,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@GetUser() user: AuthUser, @Body() dto: CreateAddressDto) {
    return this.addressesService.create(user.id, dto);
  }

  @Patch(':id')
  @ResponseMessage('Address updated successfully')
  @ApiOperation({ summary: 'Update an address' })
  @ApiParam({ name: 'id', description: 'Address ID', example: 1 })
  @ApiBody({
    type: UpdateAddressDto,
    examples: {
      address: {
        summary: 'Update address body',
        value: { ...addressBody, isDefault: false },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Address updated',
    schema: {
      example: {
        status: true,
        message: 'Address updated successfully',
        data: { ...addressExample, isDefault: false },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  update(
    @GetUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressesService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ResponseMessage('Address removed successfully')
  @ApiOperation({ summary: 'Remove an address' })
  @ApiParam({ name: 'id', description: 'Address ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Address removed',
    schema: {
      example: { status: true, message: 'Address removed successfully' },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  remove(@GetUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.addressesService.remove(user.id, id);
  }
}
